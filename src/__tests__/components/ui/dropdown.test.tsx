import { fireEvent, renderWithProviders, screen } from "../../test-utils";
import Dropdown from "../../../components/ui/dropdown";

describe("Dropdown Component", () => {
  const mockItems = [
    { label: "Item 1", onClick: vi.fn() },
    { label: "Item 2", href: "/item-2" },
    { label: "Item 3", onClick: vi.fn() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("opens dropdown when key is pressed on closed dropdown", () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );
    const trigger = document.querySelector(".popover");

    fireEvent.keyDown(trigger!, { key: "ArrowDown" });
    expect(screen.getByText("Item 1")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    fireEvent.keyDown(trigger!, { key: "Enter" });
    expect(screen.getByText("Item 1")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    fireEvent.keyDown(trigger!, { key: " " });
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("navigates up with arrow key", () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );
    fireEvent.click(document.querySelector(".popover")!);
    const popoverContent = screen.getByRole("dialog");

    fireEvent.keyDown(popoverContent, { key: "ArrowDown" });
    fireEvent.keyDown(popoverContent, { key: "ArrowDown" });

    const listItems = screen.getAllByRole("menuitem");
    expect(listItems[1]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(popoverContent, { key: "ArrowUp" });
    expect(listItems[0]).toHaveAttribute("aria-selected", "true");
    expect(listItems[1]).toHaveAttribute("aria-selected", "false");
  });

  it("selects item with Enter key", () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );
    fireEvent.click(document.querySelector(".popover")!);
    const popoverContent = screen.getByRole("dialog");

    fireEvent.keyDown(popoverContent, { key: "ArrowDown" });
    fireEvent.keyDown(popoverContent, { key: "Enter" });

    expect(mockItems[0].onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });

  it("handles other key presses with no effect", () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );
    fireEvent.click(document.querySelector(".popover")!);
    const popoverContent = screen.getByRole("dialog");

    fireEvent.keyDown(popoverContent, { key: "A" });
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("shows dropdown content when trigger is clicked", async () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("renders link items correctly", async () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const linkItem = screen.getByText("Item 2");
    expect(linkItem.closest("a")).toHaveAttribute("href", "/item-2");
  });

  it("renders button items correctly", async () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const buttonItem = screen.getByText("Item 1");
    expect(buttonItem.tagName).toBe("BUTTON");
    expect(buttonItem).toHaveAttribute("type", "button");
  });

  it("calls onClick when button item is clicked", async () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);
    fireEvent.click(screen.getByText("Item 1"));

    expect(mockItems[0].onClick).toHaveBeenCalledTimes(1);
  });

  it("renders React node items correctly", async () => {
    const nodeItems = [
      ...mockItems,
      <div key="custom" data-testid="custom-node">
        Custom Node
      </div>,
    ];

    renderWithProviders(
      <Dropdown items={nodeItems} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    expect(screen.getByTestId("custom-node")).toBeInTheDocument();
    expect(screen.getByText("Custom Node")).toBeInTheDocument();
  });

  it("handles keyboard navigation correctly", async () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);
    const popoverContent = screen.getByRole("dialog");

    fireEvent.keyDown(popoverContent, { key: "ArrowDown" });

    const firstItem = screen.getByText("Item 1").closest("button");
    expect(firstItem?.className).toContain("bg-gray-100");

    fireEvent.keyDown(popoverContent, { key: "ArrowDown" });

    const secondItem = screen.getByText("Item 2").closest("a");
    expect(secondItem?.className).toContain("bg-gray-100");
  });

  it("sets aria-selected correctly for active item", async () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);
    const popoverContent = screen.getByRole("dialog");

    fireEvent.keyDown(popoverContent, { key: "ArrowDown" });

    const listItems = screen.getAllByRole("menuitem");

    expect(listItems[0]).toHaveAttribute("aria-selected", "true");
    expect(listItems[1]).toHaveAttribute("aria-selected", "false");
    expect(listItems[2]).toHaveAttribute("aria-selected", "false");
  });

  it("filters out null items", async () => {
    const itemsWithNull = [...mockItems, null];

    renderWithProviders(
      <Dropdown items={itemsWithNull} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const listItems = screen.getAllByRole("menuitem");
    expect(listItems.length).toBe(3);
  });

  it("activates item on mouse enter", async () => {
    renderWithProviders(
      <Dropdown items={mockItems} trigger={<button>Open</button>} />,
    );

    fireEvent.click(document.querySelector(".popover")!);

    const listItems = screen.getAllByRole("menuitem");

    fireEvent.mouseEnter(listItems[1]);

    expect(listItems[0]).toHaveAttribute("aria-selected", "false");
    expect(listItems[1]).toHaveAttribute("aria-selected", "true");
    expect(listItems[2]).toHaveAttribute("aria-selected", "false");
  });
});
