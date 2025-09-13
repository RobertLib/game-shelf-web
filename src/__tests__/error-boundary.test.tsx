import { fireEvent, renderWithProviders, screen } from "./test-utils";
import ErrorBoundary from "../error-boundary";
import logger from "../utils/logger";

vi.mock("../utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div data-testid="success">No error</div>;
}

function ErrorThrower({ error }: { error?: Error }) {
  if (error) {
    throw error;
  }
  return <div>Normal component</div>;
}

describe("ErrorBoundary Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when there is no error", () => {
    renderWithProviders(
      <ErrorBoundary>
        <div data-testid="child-component">Child content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("child-component")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders error UI when child component throws an error", () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.queryByTestId("success")).not.toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Error: Test error message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const customFallback = (
      <div data-testid="custom-fallback">Custom error message</div>
    );

    renderWithProviders(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("logs error when componentDidCatch is called", () => {
    const testError = new Error("Test error for logging");

    renderWithProviders(
      <ErrorBoundary>
        <ErrorThrower error={testError} />
      </ErrorBoundary>,
    );

    expect(logger.error).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      testError,
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });

  it("resets error state when Try again button is clicked", () => {
    let shouldThrow = true;

    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error("Test error message");
      }
      return <div data-testid="success">No error</div>;
    };

    const { rerender } = renderWithProviders(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    shouldThrow = false;

    rerender(
      <ErrorBoundary key="reset">
        <TestComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("success")).toBeInTheDocument();
    expect(screen.getByText("No error")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("handles error without message", () => {
    const errorWithoutMessage = new Error();
    errorWithoutMessage.message = "";

    renderWithProviders(
      <ErrorBoundary>
        <ErrorThrower error={errorWithoutMessage} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByText("Error:")).not.toBeInTheDocument();
  });

  it("applies correct classes to error container", () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const tryAgainButton = screen.getByRole("button", { name: "Try again" });
    const mainContainer = tryAgainButton.parentElement;
    expect(mainContainer).toHaveClass(
      "container",
      "mx-auto",
      "space-y-4",
      "p-6",
    );
  });

  it("renders Alert component with correct type", () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveClass("rounded-lg");
    expect(alert).toHaveClass("bg-gradient-to-r");
    expect(alert).toHaveClass("from-danger-50");
    expect(alert).toHaveClass("to-danger-50");
  });

  it("renders error message with correct styling", () => {
    renderWithProviders(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const errorMessage = screen.getByText("Error: Test error message");
    expect(errorMessage).toHaveClass("font-mono");

    const errorContainer = errorMessage.closest("div");
    expect(errorContainer).toHaveClass(
      "text-sm",
      "text-gray-600",
      "dark:text-gray-400",
    );
  });

  it("handles multiple children correctly", () => {
    renderWithProviders(
      <ErrorBoundary>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span>Text node</span>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByText("Text node")).toBeInTheDocument();
  });

  it("maintains error state across re-renders until reset", () => {
    const { rerender } = renderWithProviders(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <div>Different content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByText("Different content")).not.toBeInTheDocument();
  });

  it("handles complex error scenarios", () => {
    const complexError = new Error("Complex error");
    complexError.stack = "Error stack trace";

    renderWithProviders(
      <ErrorBoundary>
        <ErrorThrower error={complexError} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Error: Complex error")).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      complexError,
      expect.any(Object),
    );
  });
});
