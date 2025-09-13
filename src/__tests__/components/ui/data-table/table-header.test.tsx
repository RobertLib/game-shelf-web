import { Column } from "../../../../components/ui/data-table";
import { fireEvent, renderWithProviders, screen } from "../../../test-utils";
import { TableHeader } from "../../../../components/ui/data-table/table-header";

describe("TableHeader Component", () => {
  const mockColumns: Column<unknown>[] = [
    { key: "name", label: "Jméno" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const defaultProps = {
    columnOrder: ["name", "email", "role"],
    columns: mockColumns,
    columnVisibility: { name: true, email: true, role: true },
    handleDragOver: vi.fn(),
    handleDragStart: vi.fn(),
    handleDrop: vi.fn(),
    handlePinColumn: vi.fn(),
    isFullScreen: false,
    onResetSettings: vi.fn(),
    pinnedColumns: { left: [], right: [] },
    setColumnVisibility: vi.fn(),
    setIsFullScreen: vi.fn(),
    toolbar: <div data-testid="toolbar">Toolbar Content</div>,
  };

  // Mock setDragImage for drag and drop tests
  beforeEach(() => {
    vi.clearAllMocks();
    global.DataTransfer = class MockDataTransfer {
      setData = vi.fn();
      getData = vi.fn();
      setDragImage = vi.fn();
    } as unknown as typeof DataTransfer;
  });

  it("renders correctly with required props", () => {
    renderWithProviders(<TableHeader {...defaultProps} />);

    expect(screen.getByTestId("toolbar")).toBeInTheDocument();

    expect(
      screen.getByLabelText("Toggle column visibility"),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Toggle full screen")).toBeInTheDocument();
  });

  it("toggles fullscreen mode when button is clicked", () => {
    renderWithProviders(<TableHeader {...defaultProps} />);

    const fullscreenButton = screen.getByLabelText("Toggle full screen");
    fireEvent.click(fullscreenButton);

    expect(defaultProps.setIsFullScreen).toHaveBeenCalled();
  });

  it("displays the correct icon based on fullscreen state", () => {
    renderWithProviders(<TableHeader {...defaultProps} isFullScreen={false} />);
    expect(document.querySelector("svg.lucide-maximize")).toBeInTheDocument();

    renderWithProviders(<TableHeader {...defaultProps} isFullScreen={true} />);
    expect(document.querySelector("svg.lucide-minimize")).toBeInTheDocument();
  });

  it("disables reset button when no custom settings are present", () => {
    renderWithProviders(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const resetButton = screen.getByText("Reset");
    expect(resetButton).toBeDisabled();
  });

  it("enables reset button when custom settings are present", () => {
    const customProps = {
      ...defaultProps,
      columnOrder: ["email", "name", "role"],
      columnVisibility: { name: true, email: false, role: true },
      pinnedColumns: { left: ["name"], right: [] },
    };

    renderWithProviders(<TableHeader {...customProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const resetButton = screen.getByText("Reset");
    expect(resetButton).not.toBeDisabled();
  });

  it("calls onResetSettings when reset button is clicked", () => {
    const customProps = {
      ...defaultProps,
      columnOrder: ["email", "name", "role"],
    };

    renderWithProviders(<TableHeader {...customProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(defaultProps.onResetSettings).toHaveBeenCalled();
  });

  it("calls handlePinColumn when pin buttons are clicked", () => {
    renderWithProviders(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const pinLeftButton = screen.getByLabelText("Pin column Jméno to left");
    fireEvent.click(pinLeftButton);

    expect(defaultProps.handlePinColumn).toHaveBeenCalledWith("name", "left");

    const pinRightButton = screen.getByLabelText("Pin column Jméno to right");
    fireEvent.click(pinRightButton);

    expect(defaultProps.handlePinColumn).toHaveBeenCalledWith("name", "right");
  });

  it("visually indicates pinned columns", () => {
    const pinnedProps = {
      ...defaultProps,
      pinnedColumns: { left: ["name"], right: ["role"] },
    };

    renderWithProviders(<TableHeader {...pinnedProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const pinLeftButtons = screen.getAllByLabelText(/Pin column .* to left/);
    const pinRightButtons = screen.getAllByLabelText(/Pin column .* to right/);

    expect(pinLeftButtons[0]).toHaveClass("text-primary-500");
    expect(pinRightButtons[2]).toHaveClass("text-primary-500");
  });

  it("calls setColumnVisibility when visibility switch is toggled", () => {
    renderWithProviders(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const switches = document.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(switches[0]);

    expect(defaultProps.setColumnVisibility).toHaveBeenCalled();
  });

  it("renders columns in the specified order", () => {
    const reorderedProps = {
      ...defaultProps,
      columnOrder: ["role", "name", "email"],
    };

    renderWithProviders(<TableHeader {...reorderedProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const columnLabels = screen.getAllByText(/Jméno|Email|Role/);
    expect(columnLabels[0].textContent).toBe("Role");
    expect(columnLabels[1].textContent).toBe("Jméno");
    expect(columnLabels[2].textContent).toBe("Email");
  });

  it("handles column drag and drop operations", () => {
    renderWithProviders(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const dragHandles = screen.getAllByTestId(/drag-handle-/);
    expect(dragHandles.length).toBeGreaterThan(0);

    fireEvent.dragStart(dragHandles[0]);
    expect(defaultProps.handleDragStart).toHaveBeenCalled();

    fireEvent.dragOver(dragHandles[1]);
    expect(defaultProps.handleDragOver).toHaveBeenCalled();

    fireEvent.drop(dragHandles[1]);
    expect(defaultProps.handleDrop).toHaveBeenCalled();
  });

  it("handles column pinning to left", () => {
    renderWithProviders(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const leftPinButtons = screen.getAllByLabelText(/Pin column .* to left/);
    expect(leftPinButtons.length).toBe(3);

    fireEvent.click(leftPinButtons[0]);
    expect(defaultProps.handlePinColumn).toHaveBeenCalledWith("name", "left");
  });

  it("handles column pinning to right", () => {
    renderWithProviders(<TableHeader {...defaultProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const rightPinButtons = screen.getAllByLabelText(/Pin column .* to right/);
    expect(rightPinButtons.length).toBe(3);

    fireEvent.click(rightPinButtons[0]);
    expect(defaultProps.handlePinColumn).toHaveBeenCalledWith("name", "right");
  });

  it("shows pinned status for pinned columns", () => {
    const pinnedProps = {
      ...defaultProps,
      pinnedColumns: { left: ["name"], right: ["role"] },
    };

    renderWithProviders(<TableHeader {...pinnedProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const nameRow = screen.getByText("Jméno").closest("div");
    const roleRow = screen.getByText("Role").closest("div");

    expect(nameRow).toBeInTheDocument();
    expect(roleRow).toBeInTheDocument();
  });

  it("handles reset settings", () => {
    const propsWithCustomSettings = {
      ...defaultProps,
      pinnedColumns: { left: ["name"], right: [] },
    };

    renderWithProviders(<TableHeader {...propsWithCustomSettings} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(defaultProps.onResetSettings).toHaveBeenCalled();
  });

  it("displays correct fullscreen icon based on state", () => {
    const { rerender } = renderWithProviders(<TableHeader {...defaultProps} />);

    let fullscreenButton = screen.getByLabelText("Toggle full screen");
    expect(fullscreenButton.querySelector("svg")).toBeInTheDocument();

    const fullscreenProps = { ...defaultProps, isFullScreen: true };
    rerender(<TableHeader {...fullscreenProps} />);

    fullscreenButton = screen.getByLabelText("Toggle full screen");
    expect(fullscreenButton.querySelector("svg")).toBeInTheDocument();
  });

  it("handles column visibility toggling", () => {
    const visibilityProps = {
      ...defaultProps,
      columnVisibility: { name: true, email: false, role: true },
    };

    renderWithProviders(<TableHeader {...visibilityProps} />);

    const toggleButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(toggleButton);

    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBe(3);

    expect(switches[0]).toBeChecked();
    expect(switches[1]).not.toBeChecked();
    expect(switches[2]).toBeChecked();

    fireEvent.click(switches[1]);
    expect(defaultProps.setColumnVisibility).toHaveBeenCalled();
  });

  it("renders with custom toolbar", () => {
    const customToolbar = (
      <div data-testid="custom-toolbar">
        <button>Custom Action</button>
        <input placeholder="Search..." />
      </div>
    );

    const customProps = { ...defaultProps, toolbar: customToolbar };
    renderWithProviders(<TableHeader {...customProps} />);

    expect(screen.getByTestId("custom-toolbar")).toBeInTheDocument();
    expect(screen.getByText("Custom Action")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("renders without toolbar", () => {
    const noToolbarProps = { ...defaultProps, toolbar: null };
    renderWithProviders(<TableHeader {...noToolbarProps} />);

    expect(screen.queryByTestId("toolbar")).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Toggle column visibility"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle full screen")).toBeInTheDocument();
  });
});
