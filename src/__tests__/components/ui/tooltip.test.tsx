import { act, fireEvent, renderWithProviders, screen } from "../../test-utils";
import Tooltip from "../../../components/ui/tooltip";

describe("Tooltip Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders correctly with children", () => {
    renderWithProviders(
      <Tooltip title="Tooltip Text">
        <button>Hover Me</button>
      </Tooltip>,
    );

    expect(screen.getByText("Hover Me")).toBeInTheDocument();
    expect(screen.queryByText("Tooltip Text")).not.toBeInTheDocument();
  });

  it("shows tooltip after delay when mouse enters", () => {
    renderWithProviders(
      <Tooltip title="Tooltip Text" delay={500}>
        <button>Hover Me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText("Hover Me");
    fireEvent.mouseEnter(trigger);

    expect(screen.queryByText("Tooltip Text")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText("Tooltip Text")).toBeInTheDocument();
  });

  it("hides tooltip when mouse leaves", () => {
    renderWithProviders(
      <Tooltip title="Tooltip Text" delay={500}>
        <button>Hover Me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText("Hover Me");

    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("Tooltip Text")).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText("Tooltip Text")).not.toBeInTheDocument();
  });

  it("cancels pending tooltip when mouse leaves before delay", () => {
    renderWithProviders(
      <Tooltip title="Tooltip Text" delay={1000}>
        <button>Hover Me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText("Hover Me");

    fireEvent.mouseEnter(trigger);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.mouseLeave(trigger);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.queryByText("Tooltip Text")).not.toBeInTheDocument();
  });

  it("hides tooltip on click and calls onClick", () => {
    const handleClick = vi.fn();
    renderWithProviders(
      <Tooltip title="Tooltip Text" onClick={handleClick}>
        <button>Click Me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText("Click Me");

    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Tooltip Text")).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.queryByText("Tooltip Text")).not.toBeInTheDocument();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies correct position styles", () => {
    const positions = ["top", "bottom", "left", "right"] as const;

    positions.forEach((position) => {
      const { unmount } = renderWithProviders(
        <Tooltip title="Tooltip Text" position={position} delay={0}>
          <button>Hover Me</button>
        </Tooltip>,
      );

      fireEvent.mouseEnter(screen.getByText("Hover Me"));
      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByRole("tooltip");

      switch (position) {
        case "top":
          expect(tooltip).toHaveClass("bottom-full");
          expect(tooltip).toHaveClass("left-1/2");
          expect(tooltip).toHaveClass("-translate-x-1/2");
          expect(tooltip).toHaveClass("mb-2");
          break;
        case "bottom":
          expect(tooltip).toHaveClass("top-full");
          expect(tooltip).toHaveClass("left-1/2");
          expect(tooltip).toHaveClass("-translate-x-1/2");
          expect(tooltip).toHaveClass("mt-2");
          break;
        case "left":
          expect(tooltip).toHaveClass("right-full");
          expect(tooltip).toHaveClass("top-1/2");
          expect(tooltip).toHaveClass("-translate-y-1/2");
          expect(tooltip).toHaveClass("mr-2");
          break;
        case "right":
          expect(tooltip).toHaveClass("left-full");
          expect(tooltip).toHaveClass("top-1/2");
          expect(tooltip).toHaveClass("-translate-y-1/2");
          expect(tooltip).toHaveClass("ml-2");
          break;
      }

      unmount();
    });
  });

  it("sets correct ARIA attributes", () => {
    renderWithProviders(
      <Tooltip title="Tooltip Text">
        <button>Hover Me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText("Hover Me").parentElement;
    expect(trigger).not.toHaveAttribute("aria-describedby");

    fireEvent.mouseEnter(screen.getByText("Hover Me"));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(trigger).toHaveAttribute("aria-describedby", "test-id");

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveAttribute("id", "test-id");
    expect(tooltip).toHaveAttribute("aria-hidden", "false");
  });

  it("applies custom className", () => {
    renderWithProviders(
      <Tooltip
        title="Tooltip Text"
        className="custom-class"
        data-testid="tooltip-container"
      >
        <button>Hover Me</button>
      </Tooltip>,
    );

    const container = screen.getByTestId("tooltip-container");
    expect(container).toHaveClass("custom-class");
    expect(container).toHaveClass("relative");
    expect(container).toHaveClass("inline-flex");
  });

  it("forwards additional props to div element", () => {
    renderWithProviders(
      <Tooltip
        title="Tooltip Text"
        data-testid="tooltip-test"
        aria-label="Tooltip element"
      >
        <button>Hover Me</button>
      </Tooltip>,
    );

    const container = screen.getByTestId("tooltip-test");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("aria-label", "Tooltip element");
  });

  it("applies default delay when not specified", () => {
    renderWithProviders(
      <Tooltip title="Tooltip Text">
        <button>Hover Me</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByText("Hover Me"));

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText("Tooltip Text")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("Tooltip Text")).toBeInTheDocument();
  });

  it("shows different arrow positions based on tooltip position", () => {
    const positions = ["top", "bottom", "left", "right"] as const;

    positions.forEach((position) => {
      const { unmount } = renderWithProviders(
        <Tooltip title="Tooltip Text" position={position} delay={0}>
          <button>Hover Me</button>
        </Tooltip>,
      );

      fireEvent.mouseEnter(screen.getByText("Hover Me"));
      act(() => {
        vi.advanceTimersByTime(0);
      });

      const arrow = screen.getByRole("tooltip").querySelector("div");

      switch (position) {
        case "top":
          expect(arrow).toHaveClass("bottom-[-4px]");
          expect(arrow).toHaveClass("left-1/2");
          expect(arrow).toHaveClass("-translate-x-1/2");
          break;
        case "bottom":
          expect(arrow).toHaveClass("top-[-4px]");
          expect(arrow).toHaveClass("left-1/2");
          expect(arrow).toHaveClass("-translate-x-1/2");
          break;
        case "left":
          expect(arrow).toHaveClass("top-1/2");
          expect(arrow).toHaveClass("right-[-4px]");
          expect(arrow).toHaveClass("-translate-y-1/2");
          break;
        case "right":
          expect(arrow).toHaveClass("top-1/2");
          expect(arrow).toHaveClass("left-[-4px]");
          expect(arrow).toHaveClass("-translate-y-1/2");
          break;
      }

      unmount();
    });
  });
});
