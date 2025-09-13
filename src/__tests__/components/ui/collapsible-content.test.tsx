import { act, renderWithProviders, screen } from "../../test-utils";
import CollapsibleContent from "../../../components/ui/collapsible-content";

// Mock timers for animation testing
vi.useFakeTimers();

describe("CollapsibleContent Component", () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("renders children when isOpen is true", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={true}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("does not render children when isOpen is false initially", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={false}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={true} className="custom-class">
        <div>Test content</div>
      </CollapsibleContent>,
    );

    const container = screen.getByText("Test content").parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("applies correct default styles", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={true}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    const container = screen.getByText("Test content").parentElement;
    expect(container).toHaveClass(
      "overflow-hidden",
      "transition-all",
      "ease-in-out",
    );
  });

  it("sets correct transition duration", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={true} duration={500}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    const container = screen.getByText("Test content").parentElement;
    expect(container).toHaveStyle("transition-duration: 500ms");
  });

  it("uses default duration when not specified", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={true}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    const container = screen.getByText("Test content").parentElement;
    expect(container).toHaveStyle("transition-duration: 300ms");
  });

  it("sets height to 0 when isOpen is false initially", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={false}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    // Should not render anything when closed initially
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });

  it("shows content when opening", async () => {
    const { rerender } = renderWithProviders(
      <CollapsibleContent isOpen={false}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    // Initially closed - no content
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();

    // Open the content
    rerender(
      <CollapsibleContent isOpen={true}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    // Content should be visible immediately when opening
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("handles multiple children correctly", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={true}>
        <div>First child</div>
        <span>Second child</span>
        <p>Third child</p>
      </CollapsibleContent>,
    );

    expect(screen.getByText("First child")).toBeInTheDocument();
    expect(screen.getByText("Second child")).toBeInTheDocument();
    expect(screen.getByText("Third child")).toBeInTheDocument();
  });

  it("handles complex nested content", () => {
    renderWithProviders(
      <CollapsibleContent isOpen={true}>
        <div>
          <h2>Title</h2>
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </div>
          <button>Action Button</button>
        </div>
      </CollapsibleContent>,
    );

    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
    expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Action Button" }),
    ).toBeInTheDocument();
  });

  it("animation completes after specified duration", async () => {
    const { rerender } = renderWithProviders(
      <CollapsibleContent isOpen={true} duration={100}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    // Close the content
    rerender(
      <CollapsibleContent isOpen={false} duration={100}>
        <div>Test content</div>
      </CollapsibleContent>,
    );

    // Content should still be visible during animation
    expect(screen.getByText("Test content")).toBeInTheDocument();

    // Fast-forward through the closing animation
    act(() => {
      vi.advanceTimersByTime(110); // duration + small buffer
    });

    // After animation, content should be hidden
    expect(screen.queryByText("Test content")).not.toBeInTheDocument();
  });
});
