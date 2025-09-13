import { act, fireEvent, renderWithProviders, screen } from "../../test-utils";
import Dialog from "../../../components/ui/dialog";

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Dialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders dialog with content", () => {
    const { container } = renderWithProviders(
      <Dialog>
        <p>Dialog content</p>
      </Dialog>,
    );

    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    const { container } = renderWithProviders(
      <Dialog title="Test Dialog">Content</Dialog>,
    );

    const titleElement = container.querySelector("h2");
    expect(titleElement).toHaveTextContent("Test Dialog");
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Dialog className="custom-class">Content</Dialog>,
    );

    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).toHaveClass("custom-class");
  });

  it("calls navigate(-1) when close button is clicked", async () => {
    const { container } = renderWithProviders(
      <Dialog title="Test Dialog">Content</Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const closeButton = container.querySelector(
      "button[aria-label='Close dialog']",
    )!;
    fireEvent.click(closeButton);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("closes dialog when clicking outside", async () => {
    const { container } = renderWithProviders(
      <Dialog title="Test Dialog">Content</Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const backdrop = container.querySelector(".fixed.inset-0.bg-black\\/50");
    fireEvent.click(backdrop!);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("closes dialog on Escape key", () => {
    renderWithProviders(<Dialog title="Test Dialog">Content</Dialog>);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    fireEvent.keyDown(document, { key: "Escape" });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("manages focus trap behavior", () => {
    const { container } = renderWithProviders(
      <Dialog title="Test Dialog">
        <button>First Button</button>
        <button>Second Button</button>
      </Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    const firstContentButton = buttons.find(
      (btn) => btn.textContent === "First Button",
    )!;
    const secondContentButton = buttons.find(
      (btn) => btn.textContent === "Second Button",
    )!;
    const closeButton = container.querySelector(
      "button[aria-label='Close dialog']",
    ) as HTMLButtonElement;

    expect(firstContentButton).toBeInTheDocument();
    expect(secondContentButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();

    firstContentButton.focus();
    expect(document.activeElement).toBe(firstContentButton);

    secondContentButton.focus();
    expect(document.activeElement).toBe(secondContentButton);

    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);
  });

  it("passes additional props to dialog element", () => {
    const { container } = renderWithProviders(
      <Dialog data-testid="test-dialog" title="Test Dialog">
        Content
      </Dialog>,
    );

    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).toHaveAttribute("data-testid", "test-dialog");
  });

  it("handles Tab key navigation for focus trapping", () => {
    const { container } = renderWithProviders(
      <Dialog title="Test Dialog">
        <input data-testid="first-input" />
        <button data-testid="middle-button">Middle</button>
        <input data-testid="last-input" />
      </Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const closeButton = container.querySelector(
      "button[aria-label='Close dialog']",
    ) as HTMLElement;
    const lastInput = screen.getByTestId("last-input");

    lastInput.focus();
    fireEvent.keyDown(document, { key: "Tab" });

    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    expect(lastInput).toHaveFocus();
  });

  it("handles Tab navigation when no focusable elements exist", () => {
    renderWithProviders(
      <Dialog title="Test Dialog">
        <div>No focusable content</div>
      </Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(() => {
      fireEvent.keyDown(document, { key: "Tab" });
    }).not.toThrow();
  });

  it("ignores non-Tab key events in focus trap", () => {
    renderWithProviders(
      <Dialog title="Test Dialog">
        <button>Test Button</button>
      </Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(() => {
      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: "Space" });
      fireEvent.keyDown(document, { key: "ArrowDown" });
    }).not.toThrow();
  });

  it("handles dialog without title and aria-label", () => {
    const { container } = renderWithProviders(
      <Dialog>Content without title or aria-label</Dialog>,
    );

    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).not.toHaveAttribute("aria-labelledby");
    expect(dialog).not.toHaveAttribute("aria-label");
  });

  it("cleans up timeouts on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount } = renderWithProviders(
      <Dialog title="Test Dialog">Content</Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("restores initial focus when dialog closes", async () => {
    const initialFocusElement = document.createElement("button");
    initialFocusElement.id = "initial-focus";
    document.body.appendChild(initialFocusElement);
    initialFocusElement.focus();

    const { container } = renderWithProviders(
      <Dialog title="Test Dialog">
        <button>Dialog Button</button>
      </Dialog>,
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const closeButton = container.querySelector(
      "button[aria-label='Close dialog']",
    )!;
    fireEvent.click(closeButton);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(initialFocusElement).toHaveFocus();

    document.body.removeChild(initialFocusElement);
  });

  it("sets body overflow to hidden on mount and restores on unmount", () => {
    const originalOverflow = "visible";
    document.body.style.overflow = originalOverflow;

    const { unmount } = renderWithProviders(
      <Dialog title="Test Dialog">Content</Dialog>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it("handles dialog without title but with aria-label", () => {
    const { container } = renderWithProviders(
      <Dialog aria-label="Custom aria label">Content</Dialog>,
    );

    const dialog = container.querySelector("[role='dialog']");
    expect(dialog).toHaveAttribute("aria-label", "Custom aria label");
    expect(dialog).not.toHaveAttribute("aria-labelledby");
  });
});
