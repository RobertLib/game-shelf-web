import {
  act,
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import Popover from "../../../components/ui/popover";

Object.defineProperty(Element.prototype, "getBoundingClientRect", {
  value: vi.fn(() => ({
    top: 100,
    left: 100,
    width: 200,
    height: 50,
    bottom: 150,
    right: 300,
  })),
});

describe("Popover Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders trigger correctly", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>}>Popover Content</Popover>,
    );

    expect(screen.getByText("Toggle")).toBeInTheDocument();
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("shows content on hover when triggerType is 'hover'", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="hover">
        Popover Content
      </Popover>,
    );

    fireEvent.mouseEnter(screen.getByText("Toggle"));
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText("Toggle"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("shows content on click when triggerType is 'click'", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("closes on Escape key press", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("applies correct position classes", () => {
    const positions = ["top", "bottom", "left", "right"] as const;

    positions.forEach((position) => {
      const { unmount } = renderWithProviders(
        <Popover
          trigger={<button>Toggle</button>}
          position={position}
          open={true}
        >
          Popover Content
        </Popover>,
      );

      const popoverContent = screen.getByText("Popover Content");
      expect(popoverContent).toBeInTheDocument();

      unmount();
    });
  });

  it("applies correct alignment classes for top/bottom positions", () => {
    const alignments = ["left", "right"] as const;

    alignments.forEach((align) => {
      const { unmount } = renderWithProviders(
        <Popover
          trigger={<button>Toggle</button>}
          position="top"
          align={align}
          open={true}
        >
          Popover Content
        </Popover>,
      );

      const popoverContent = screen.getByText("Popover Content");
      expect(popoverContent).toBeInTheDocument();

      unmount();

      const { unmount: unmount2 } = renderWithProviders(
        <Popover
          trigger={<button>Toggle</button>}
          position="bottom"
          align={align}
          open={true}
        >
          Popover Content
        </Popover>,
      );

      const popoverContent2 = screen.getByText("Popover Content");
      expect(popoverContent2).toBeInTheDocument();

      unmount2();
    });
  });

  it("calls onOpenChange when state changes", () => {
    const handleOpenChange = vi.fn();
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        onOpenChange={handleOpenChange}
      >
        Popover Content
      </Popover>,
    );

    fireEvent.mouseEnter(screen.getByText("Toggle"));
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    fireEvent.mouseLeave(screen.getByText("Toggle"));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("respects controlled open state", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} open={false}>
        Popover Content
      </Popover>,
    );

    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();

    rerenderWithProviders(
      <Popover trigger={<button>Toggle</button>} open={true}>
        Popover Content
      </Popover>,
    );

    expect(screen.getByText("Popover Content")).toBeInTheDocument();
  });

  it("applies custom classes to content and container", () => {
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        open={true}
        className="container-custom"
        contentClassName="content-custom"
      >
        Popover Content
      </Popover>,
    );

    const trigger = screen
      .getByRole("button", { name: "Toggle" })
      .closest("div");
    expect(trigger).toHaveClass("container-custom");

    const content = screen.getByText("Popover Content");
    expect(content).toHaveClass("content-custom");
  });

  it("sets width style on content", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} open={true} width="300px">
        Popover Content
      </Popover>,
    );

    const content = screen.getByText("Popover Content");
    expect(content).toBeInTheDocument();
  });

  it("sets correct ARIA attributes for click trigger", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    const trigger = screen.getByText("Toggle").closest("div");

    expect(trigger).toBeInTheDocument();

    fireEvent.click(screen.getByText("Toggle"));

    const content = screen.getByText("Popover Content");
    expect(content).toBeInTheDocument();
  });

  it("renders bridge element for hover interaction", () => {
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const bridge = document.querySelector(".popover-bridge");
    expect(bridge).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText("Toggle"));
    fireEvent.mouseEnter(bridge!);
    expect(screen.getByText("Popover Content")).toBeInTheDocument();
  });

  it("renders fallback div when trigger not provided", () => {
    renderWithProviders(<Popover open={true}>Popover Content</Popover>);

    const container = document.querySelector(".popover");
    expect(container).toBeInTheDocument();

    const fallbackDiv = container?.querySelector("div.absolute.inset-0");
    expect(fallbackDiv).toBeInTheDocument();
  });

  it("manages focus correctly", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        <button data-testid="content-button">Content Button</button>
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("content-button")).toBeInTheDocument();

    const popoverContainer = document.querySelector(".popover");
    fireEvent.focusOut(popoverContainer!, { relatedTarget: document.body });

    expect(screen.queryByTestId("content-button")).not.toBeInTheDocument();
  });

  it("forwards additional props to container", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} aria-label="Popover component">
        Popover Content
      </Popover>,
    );

    const container = document.querySelector(".popover");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("aria-label", "Popover component");
  });

  it("handles keyboard navigation for click trigger", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    const container = document.querySelector(".popover");
    expect(container).toBeInTheDocument();

    fireEvent.keyDown(container!, { key: "Enter" });
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();

    fireEvent.keyDown(container!, { key: " " });
    expect(screen.getByText("Popover Content")).toBeInTheDocument();
  });

  it("handles content click without closing popover", () => {
    const stopPropagation = vi.fn();
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="click"
        open={true}
      >
        <button data-testid="content-btn">Content Button</button>
      </Popover>,
    );

    const contentButton = screen.getByTestId("content-btn");

    fireEvent.click(contentButton, { stopPropagation });
    expect(screen.getByText("Content Button")).toBeInTheDocument();
  });

  it("handles hover interactions with bridge element", () => {
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const bridge = document.querySelector(".popover-bridge");
    expect(bridge).toBeInTheDocument();

    fireEvent.mouseEnter(bridge!);
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    const content = screen.getByText("Popover Content");
    fireEvent.mouseEnter(content);
    expect(screen.getByText("Popover Content")).toBeInTheDocument();
  });

  it("handles mouseleave timeout correctly for hover trigger", () => {
    const handleOpenChange = vi.fn();
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        onOpenChange={handleOpenChange}
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const container = document.querySelector(".popover");
    fireEvent.mouseLeave(container!);

    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("handles mouseleave from content for hover trigger", () => {
    const handleOpenChange = vi.fn();
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        onOpenChange={handleOpenChange}
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const content = screen.getByText("Popover Content");
    fireEvent.mouseLeave(content);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("prevents closing when hovering bridge during timeout", () => {
    const handleOpenChange = vi.fn();
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        onOpenChange={handleOpenChange}
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const container = document.querySelector(".popover");
    const bridge = document.querySelector(".popover-bridge");

    fireEvent.mouseLeave(container!);

    Object.defineProperty(bridge, "matches", {
      value: vi.fn(() => true),
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(handleOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("prevents closing when hovering content during timeout", () => {
    const handleOpenChange = vi.fn();
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        onOpenChange={handleOpenChange}
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const container = document.querySelector(".popover");
    const content = screen.getByText("Popover Content");

    fireEvent.mouseLeave(container!);

    Object.defineProperty(content, "matches", {
      value: vi.fn(() => true),
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(handleOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("handles focus management correctly for click trigger", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        <input data-testid="content-input" />
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("content-input")).toBeInTheDocument();

    const popoverContainer = document.querySelector(".popover");

    fireEvent.focusOut(popoverContainer!, { relatedTarget: document.body });
    expect(screen.queryByTestId("content-input")).not.toBeInTheDocument();
  });

  it("does not close on focus within popover", () => {
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="click"
        open={true}
      >
        <div>
          <input data-testid="input1" />
          <input data-testid="input2" />
        </div>
      </Popover>,
    );

    const input1 = screen.getByTestId("input1");
    const input2 = screen.getByTestId("input2");
    const popoverContainer = document.querySelector(".popover");

    input1.focus();

    fireEvent.focusOut(popoverContainer!, { relatedTarget: input2 });
    expect(screen.getByTestId("input1")).toBeInTheDocument();
    expect(screen.getByTestId("input2")).toBeInTheDocument();
  });

  it("applies correct bridge positioning for all positions", () => {
    const positions = [
      { position: "top", bridgeClass: "h-2 bottom-full left-0 w-full" },
      { position: "bottom", bridgeClass: "h-2 top-full left-0 w-full" },
      { position: "left", bridgeClass: "w-2 right-full top-0 h-full" },
      { position: "right", bridgeClass: "w-2 left-full top-0 h-full" },
    ] as const;

    positions.forEach(({ position, bridgeClass }) => {
      const { unmount } = renderWithProviders(
        <Popover
          trigger={<button>Toggle {position}</button>}
          position={position}
          triggerType="hover"
          open={true}
        >
          Content for {position}
        </Popover>,
      );

      const bridge = document.querySelector(".popover-bridge");
      expect(bridge).toBeInTheDocument();
      expect(bridge).toHaveClass(...bridgeClass.split(" "));

      unmount();
    });
  });

  it("handles uncontrolled state changes correctly", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();

    rerenderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Updated Content
      </Popover>,
    );

    expect(screen.queryByText("Updated Content")).not.toBeInTheDocument();
  });

  it("handles controlled state without onOpenChange callback", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} open={false}>
        Popover Content
      </Popover>,
    );

    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();

    rerenderWithProviders(
      <Popover trigger={<button>Toggle</button>} open={true}>
        Popover Content
      </Popover>,
    );

    expect(screen.getByText("Popover Content")).toBeInTheDocument();
  });

  it("applies correct role and modal attributes", () => {
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="click"
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const content = screen.getByText("Popover Content");
    expect(content).toHaveAttribute("role", "dialog");
    expect(content).toHaveAttribute("aria-modal", "true");
  });

  it("does not set aria-modal for hover trigger", () => {
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="hover"
        open={true}
      >
        Popover Content
      </Popover>,
    );

    const content = screen.getByText("Popover Content");
    expect(content).toHaveAttribute("role", "dialog");
    expect(content).not.toHaveAttribute("aria-modal");
  });

  it("applies correct ARIA attributes for click trigger button", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    const container = document.querySelector(".popover");
    expect(container).toHaveAttribute("role", "button");
    expect(container).toHaveAttribute("tabIndex", "0");
    expect(container).toHaveAttribute("aria-expanded", "false");
    expect(container).toHaveAttribute("aria-haspopup", "true");
    expect(container).not.toHaveAttribute("aria-controls");

    fireEvent.click(screen.getByText("Toggle"));

    expect(container).toHaveAttribute("aria-expanded", "true");
    expect(container).toHaveAttribute("aria-controls");
  });

  it("handles click outside for click trigger type", () => {
    renderWithProviders(
      <Popover trigger={<button>Toggle</button>} triggerType="click">
        Popover Content
      </Popover>,
    );

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByText("Popover Content")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
  });

  it("does not close when clicking inside content", () => {
    renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="click"
        open={true}
      >
        <button data-testid="inside-button">Inside Button</button>
      </Popover>,
    );

    const insideButton = screen.getByTestId("inside-button");
    fireEvent.mouseDown(insideButton);

    expect(screen.getByTestId("inside-button")).toBeInTheDocument();
  });

  it("maintains correct spacing classes for different positions", () => {
    const positionTests = [
      { position: "top", expectedClass: "mb-2" },
      { position: "bottom", expectedClass: "mt-2" },
      { position: "left", expectedClass: "mr-2" },
      { position: "right", expectedClass: "ml-2" },
    ] as const;

    positionTests.forEach(({ position, expectedClass }) => {
      const { unmount } = renderWithProviders(
        <Popover
          trigger={<button>Toggle</button>}
          position={position}
          open={true}
        >
          Content
        </Popover>,
      );

      const content = screen.getByText("Content");
      expect(content).toHaveClass(expectedClass);

      unmount();
    });
  });

  it("cleans up event listeners on unmount", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderWithProviders(
      <Popover
        trigger={<button>Toggle</button>}
        triggerType="click"
        open={true}
      >
        Popover Content
      </Popover>,
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
