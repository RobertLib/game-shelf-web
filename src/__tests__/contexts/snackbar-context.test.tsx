import { act, fireEvent, renderWithProviders, screen } from "../test-utils";
import { SnackbarProvider } from "../../contexts/snackbar-context";
import { MockInstance } from "vitest";
import { use } from "react";
import SnackbarContext from "../../contexts/snackbar-context";

const toastMock = vi.hoisted(() =>
  vi.fn(() => <div data-testid="toast" />),
) as MockInstance;
vi.mock("../../components/ui", () => ({
  Toast: toastMock,
}));

const randomMock = vi.hoisted(() => vi.fn(() => "mock-id-123"));
global.Math.random = randomMock as unknown as () => number;

function TestComponent() {
  const { enqueueSnackbar } = use(SnackbarContext);

  return (
    <div>
      <button
        data-testid="default-toast"
        onClick={() => enqueueSnackbar("Default message")}
      >
        Show Default Toast
      </button>
      <button
        data-testid="success-toast"
        onClick={() => enqueueSnackbar("Success message", "success")}
      >
        Show Success Toast
      </button>
      <button
        data-testid="error-toast"
        onClick={() => enqueueSnackbar("Error message", "error")}
      >
        Show Error Toast
      </button>
    </div>
  );
}

describe("SnackbarContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    randomMock.mockReturnValue("mock-id-123");
  });

  it("renders children correctly", () => {
    renderWithProviders(
      <SnackbarProvider>
        <div data-testid="test-child">Test Child</div>
      </SnackbarProvider>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("shows default toast when enqueueSnackbar is called without variant", () => {
    renderWithProviders(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>,
    );

    const button = screen.getByTestId("default-toast");
    act(() => {
      fireEvent.click(button);
    });

    expect(toastMock).toHaveBeenCalledWith(
      {
        message: "Default message",
        variant: "default",
        onClose: expect.any(Function),
      },
      undefined,
    );
  });

  it("shows success toast when enqueueSnackbar is called with success variant", () => {
    renderWithProviders(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>,
    );

    const button = screen.getByTestId("success-toast");
    act(() => {
      fireEvent.click(button);
    });

    expect(toastMock).toHaveBeenCalledWith(
      {
        message: "Success message",
        variant: "success",
        onClose: expect.any(Function),
      },
      undefined,
    );
  });

  it("shows error toast when enqueueSnackbar is called with error variant", () => {
    renderWithProviders(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>,
    );

    const button = screen.getByTestId("error-toast");
    act(() => {
      fireEvent.click(button);
    });

    expect(toastMock).toHaveBeenCalledWith(
      {
        message: "Error message",
        variant: "error",
        onClose: expect.any(Function),
      },
      undefined,
    );
  });

  it("closes toast when onClose is called", () => {
    renderWithProviders(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>,
    );

    const button = screen.getByTestId("default-toast");
    act(() => {
      fireEvent.click(button);
    });

    const onClose = toastMock.mock.calls[0][0].onClose;

    act(() => {
      onClose();
    });

    toastMock.mockClear();

    renderWithProviders(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>,
    );

    expect(toastMock).not.toHaveBeenCalled();
  });

  it("can show multiple toasts", () => {
    renderWithProviders(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>,
    );

    toastMock.mockClear();

    randomMock.mockReturnValueOnce("id-1");
    act(() => {
      fireEvent.click(screen.getByTestId("default-toast"));
    });

    randomMock.mockReturnValueOnce("id-2");
    act(() => {
      fireEvent.click(screen.getByTestId("success-toast"));
    });

    randomMock.mockReturnValueOnce("id-3");
    act(() => {
      fireEvent.click(screen.getByTestId("error-toast"));
    });

    const calls = toastMock.mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(3);

    const defaultToast = calls.find(
      (call) =>
        call[0].message === "Default message" && call[0].variant === "default",
    );
    const successToast = calls.find(
      (call) =>
        call[0].message === "Success message" && call[0].variant === "success",
    );
    const errorToast = calls.find(
      (call) =>
        call[0].message === "Error message" && call[0].variant === "error",
    );

    expect(defaultToast).toBeDefined();
    expect(successToast).toBeDefined();
    expect(errorToast).toBeDefined();
  });
});
