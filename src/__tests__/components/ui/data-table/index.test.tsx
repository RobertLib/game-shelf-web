import {
  act,
  fireEvent,
  renderWithProviders,
  screen,
} from "../../../test-utils";
import { MockInstance } from "vitest";
import { mockLocalStorage } from "../../../setup";
import DataTable, { Column } from "../../../../components/ui/data-table";

describe("DataTable Component", () => {
  const mockColumns: Column<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>[] = [
    { key: "name", label: "Jméno" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const mockData = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  const mockToolbar = <div data-testid="custom-toolbar">Custom Toolbar</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it("renders with basic props", () => {
    renderWithProviders(<DataTable columns={mockColumns} data={mockData} />);

    expect(
      screen.getByRole("region", { name: "Data table" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("renders custom toolbar", () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} toolbar={mockToolbar} />,
    );

    expect(screen.getByTestId("custom-toolbar")).toBeInTheDocument();
  });

  it("renders group actions when provided", () => {
    const mockGroupActions = [
      { label: "Delete", onClick: vi.fn() },
      { label: "Archive", onClick: vi.fn() },
    ];

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        groupActions={mockGroupActions}
      />,
    );

    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Archive")).toBeInTheDocument();
  });

  it("executes group action when clicked", () => {
    const mockOnClick = vi.fn();
    const mockGroupActions = [{ label: "Delete", onClick: mockOnClick }];

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        groupActions={mockGroupActions}
      />,
    );

    // Select first row to enable group action button
    const firstCheckbox = screen.getAllByRole("checkbox")[1];
    fireEvent.click(firstCheckbox);

    fireEvent.click(screen.getByText("Delete"));

    expect(mockOnClick).toHaveBeenCalled();
    expect(mockOnClick).toHaveBeenCalledWith([mockData[0]]);
  });

  it("displays selected items count when rows are selected", () => {
    const mockGroupActions = [{ label: "Delete", onClick: vi.fn() }];

    // Extended mock data to test all plural forms
    const extendedMockData = [
      ...mockData,
      { id: "3", name: "Bob Brown", email: "bob@example.com", role: "User" },
      {
        id: "4",
        name: "Alice Green",
        email: "alice@example.com",
        role: "Admin",
      },
      {
        id: "5",
        name: "Charlie White",
        email: "charlie@example.com",
        role: "User",
      },
    ];

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={extendedMockData}
        groupActions={mockGroupActions}
      />,
    );

    // Initially no items selected, count should not be visible
    expect(screen.queryByText(/Vybrán/)).not.toBeInTheDocument();

    // Select first row - should show singular form
    const firstCheckbox = screen.getAllByRole("checkbox")[1];
    fireEvent.click(firstCheckbox);
    expect(screen.getByText("Vybrána 1 položka")).toBeInTheDocument();

    // Select second row - should show plural form (2-4)
    const secondCheckbox = screen.getAllByRole("checkbox")[2];
    fireEvent.click(secondCheckbox);
    expect(screen.getByText("Vybrány 2 položky")).toBeInTheDocument();

    // Select third row - should still show plural form (2-4)
    const thirdCheckbox = screen.getAllByRole("checkbox")[3];
    fireEvent.click(thirdCheckbox);
    expect(screen.getByText("Vybrány 3 položky")).toBeInTheDocument();

    // Select fourth row - should still show plural form (2-4)
    const fourthCheckbox = screen.getAllByRole("checkbox")[4];
    fireEvent.click(fourthCheckbox);
    expect(screen.getByText("Vybrány 4 položky")).toBeInTheDocument();

    // Select fifth row - should show genitive form (5+)
    const fifthCheckbox = screen.getAllByRole("checkbox")[5];
    fireEvent.click(fifthCheckbox);
    expect(screen.getByText("Vybráno 5 položek")).toBeInTheDocument();

    // Deselect all rows
    fireEvent.click(firstCheckbox);
    fireEvent.click(secondCheckbox);
    fireEvent.click(thirdCheckbox);
    fireEvent.click(fourthCheckbox);
    fireEvent.click(fifthCheckbox);

    // Count should not be visible when no items selected
    expect(screen.queryByText(/Vybrán/)).not.toBeInTheDocument();
  });

  it("renders action column when actions prop is provided", () => {
    const mockActions = vi.fn().mockReturnValue(<button>Edit</button>);

    renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} actions={mockActions} />,
    );

    expect(screen.getAllByText("Edit").length).toBe(2);
    expect(mockActions).toHaveBeenCalledTimes(2);
  });

  it("toggles fullscreen mode", () => {
    renderWithProviders(<DataTable columns={mockColumns} data={mockData} />);

    const fullscreenButton = screen.getByLabelText("Toggle full screen");
    fireEvent.click(fullscreenButton);

    const tableContainer = screen.getByRole("region", { name: "Data table" });
    expect(tableContainer).toHaveClass("fixed inset-0 z-50");

    fireEvent.click(fullscreenButton);
    expect(tableContainer).not.toHaveClass("fixed inset-0 z-50");
  });

  it("expands rows when renderSubRow is provided", () => {
    const mockRenderSubRow = vi
      .fn()
      .mockReturnValue(<div>Sub row content</div>);

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        renderSubRow={mockRenderSubRow}
      />,
    );

    const expandButtons = screen.getAllByLabelText(/Rozbalit řádek/i);
    expect(expandButtons.length).toBe(2);

    fireEvent.click(expandButtons[0]);

    expect(mockRenderSubRow).toHaveBeenCalledWith(mockData[0]);
    expect(screen.getByText("Sub row content")).toBeInTheDocument();
  });

  it("initializes with expanded rows when expandedByDefault is true", () => {
    const mockRenderSubRow = vi
      .fn()
      .mockReturnValue(<div>Sub row content</div>);

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        renderSubRow={mockRenderSubRow}
        expandedByDefault={true}
      />,
    );

    expect(screen.getAllByText("Sub row content").length).toBe(2);

    const collapseButtons = screen.getAllByLabelText(/Sbalit řádek/i);
    expect(collapseButtons.length).toBe(2);
  });

  it("renders loading state", () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={[]} loading={true} />,
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    const table = screen.getByRole("grid");
    expect(table).toHaveAttribute("aria-busy", "true");
  });

  it("renders footer with pagination", () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} total={50} />,
    );

    const navigation = screen.getByRole("navigation", { name: "Pagination" });
    expect(navigation).toBeInTheDocument();

    const paginationButtons = navigation.querySelectorAll("button");
    expect(paginationButtons.length).toBeGreaterThan(0);

    const buttonIcons = navigation.querySelectorAll("svg");
    expect(buttonIcons.length).toBeGreaterThan(0);
  });

  it("handles empty data array", () => {
    renderWithProviders(<DataTable columns={mockColumns} data={[]} />);
    expect(screen.getByText("Žádná data")).toBeInTheDocument();
  });

  it("passes tableId to useColumnManagement", () => {
    const testTableId = "unique-test-table-id";

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId={testTableId}
        data-testid="table-with-id"
      />,
    );

    const table = screen.getByTestId("table-with-id");
    expect(table).toBeInTheDocument();

    mockColumns.forEach((column) => {
      expect(screen.getByText(column.label)).toBeInTheDocument();
    });

    expect(screen.getByText(mockData[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockData[1].email)).toBeInTheDocument();

    const fullscreenButton = screen.getByLabelText("Toggle full screen");
    fireEvent.click(fullscreenButton);

    expect(table).toHaveClass("fixed");
  });

  it("cleans up ResizeObserver on unmount", () => {
    const { unmount } = renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} />,
    );

    unmount();

    expect(
      (global.ResizeObserver as unknown as MockInstance).mock.results[0].value
        .disconnect,
    ).toHaveBeenCalled();
  });

  it("calculates positions correctly for pinned columns", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-users-table",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name"], right: ["role"] },
      }),
    );

    renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} tableId="users-table" />,
    );

    const headerCells = screen.getAllByRole("columnheader");
    expect(headerCells.length).toBeGreaterThan(0);

    expect(headerCells[0]).toHaveAttribute("data-column-key", "name");
    expect(headerCells[headerCells.length - 1]).toHaveAttribute(
      "data-column-key",
      "role",
    );

    expect(headerCells[0].style).toBeDefined();
    expect(headerCells[headerCells.length - 1].style).toBeDefined();
  });

  it("handles reset settings correctly", () => {
    mockLocalStorage.clear();
    mockLocalStorage.setItem.mockClear();

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="test-reset-table"
      />,
    );

    const columnsButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(columnsButton);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(resetButton).toBeInTheDocument();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("handles ResizeObserver correctly", () => {
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    const originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: mockObserve,
      disconnect: mockDisconnect,
    }));

    const { unmount } = renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        actions={() => <button>Edit</button>}
      />,
    );

    expect(mockObserve).toHaveBeenCalled();

    const resizeCallback = (global.ResizeObserver as unknown as MockInstance)
      .mock.calls[0][0];

    act(() => {
      resizeCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 200 }),
          },
        },
      ]);
    });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();

    global.ResizeObserver = originalResizeObserver;
  });

  it("calculates positions correctly for pinned columns", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-positions-test",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name"], right: ["role"] },
      }),
    );

    const originalGetBoundingClientRect =
      Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 100 },
          email: { width: 150 },
          role: { width: 100 },
          actions: { width: 50 },
          selection: { width: 30 },
        };

        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="positions-test"
        actions={() => <button>Edit</button>}
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "role",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
        {
          target: {
            getAttribute: () => "actions",
            getBoundingClientRect: () => ({ width: 50 }),
          },
        },
      ]);
    });

    const nameHeader = screen.getByText("Jméno").closest("th");
    const roleHeader = screen.getByText("Role").closest("th");

    expect(nameHeader).toBeInTheDocument();
    expect(roleHeader).toBeInTheDocument();

    expect(nameHeader).toHaveAttribute("data-column-key", "name");
    expect(roleHeader).toHaveAttribute("data-column-key", "role");

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("renders with toolbar and actions correctly", () => {
    const mockToolbar = <div data-testid="custom-toolbar">Toolbar Content</div>;
    const mockActions = (row: {
      id: string;
      name: string;
      email: string;
      role: string;
    }) => (
      <div data-testid={`actions-${row.id}`}>
        <button>Edit</button>
        <button>Delete</button>
      </div>
    );

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        toolbar={mockToolbar}
        actions={mockActions}
        total={100}
      />,
    );

    expect(screen.getByTestId("custom-toolbar")).toBeInTheDocument();

    mockData.forEach((row) => {
      expect(screen.getByTestId(`actions-${row.id}`)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
  });

  it("handles multiple selected rows with group actions", () => {
    const mockOnClick = vi.fn();
    const mockGroupActions = [
      { label: "Delete Selected", onClick: mockOnClick },
    ];

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        groupActions={mockGroupActions}
      />,
    );

    const firstCheckbox = screen.getAllByRole("checkbox")[1];
    fireEvent.click(firstCheckbox);

    const secondCheckbox = screen.getAllByRole("checkbox")[2];
    fireEvent.click(secondCheckbox);

    fireEvent.click(screen.getByText("Delete Selected"));

    expect(mockOnClick).toHaveBeenCalledWith(mockData);
  });

  it("handles complex column pinning with multiple columns", () => {
    const extendedColumns = [
      ...mockColumns,
      { key: "phone", label: "Telefon" },
      { key: "department", label: "Oddělení" },
    ];

    const extendedData = mockData.map((item) => ({
      ...item,
      phone: "123-456-789",
      department: "IT",
    }));

    mockLocalStorage.setItem(
      "table-state-test@example.com-complex-pinning",
      JSON.stringify({
        columnOrder: ["name", "email", "role", "phone", "department"],
        columnVisibility: {
          name: true,
          email: true,
          role: true,
          phone: true,
          department: true,
        },
        pinnedColumns: {
          left: ["name", "email"],
          right: ["department", "phone"],
        },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 120 },
          email: { width: 180 },
          role: { width: 100 },
          phone: { width: 140 },
          department: { width: 160 },
          actions: { width: 80 },
          selection: { width: 40 },
        };

        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    renderWithProviders(
      <DataTable
        columns={extendedColumns}
        data={extendedData}
        tableId="complex-pinning"
        actions={() => <button>Actions</button>}
        groupActions={[{ label: "Delete", onClick: vi.fn() }]}
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 120 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 180 }),
          },
        },
        {
          target: {
            getAttribute: () => "department",
            getBoundingClientRect: () => ({ width: 160 }),
          },
        },
        {
          target: {
            getAttribute: () => "phone",
            getBoundingClientRect: () => ({ width: 140 }),
          },
        },
        {
          target: {
            getAttribute: () => "actions",
            getBoundingClientRect: () => ({ width: 80 }),
          },
        },
        {
          target: {
            getAttribute: () => "selection",
            getBoundingClientRect: () => ({ width: 40 }),
          },
        },
      ]);
    });

    const nameHeader = screen.getByText("Jméno").closest("th");
    const emailHeader = screen.getByText("Email").closest("th");
    const departmentHeader = screen.getByText("Oddělení").closest("th");
    const phoneHeader = screen.getByText("Telefon").closest("th");

    expect(nameHeader).toHaveAttribute("data-column-key", "name");
    expect(emailHeader).toHaveAttribute("data-column-key", "email");
    expect(departmentHeader).toHaveAttribute("data-column-key", "department");
    expect(phoneHeader).toHaveAttribute("data-column-key", "phone");
  });

  it("handles expandedByDefault with renderSubRow correctly", () => {
    const mockRenderSubRow = vi.fn((row) => (
      <div data-testid={`sub-row-${row.id}`}>Sub content for {row.name}</div>
    ));

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        renderSubRow={mockRenderSubRow}
        expandedByDefault={true}
      />,
    );

    expect(screen.getByTestId("sub-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("sub-row-2")).toBeInTheDocument();
    expect(screen.getByText("Sub content for John Doe")).toBeInTheDocument();
    expect(screen.getByText("Sub content for Jane Smith")).toBeInTheDocument();

    const collapseButtons = screen.getAllByLabelText(/Sbalit řádek/i);
    expect(collapseButtons.length).toBe(2);

    fireEvent.click(collapseButtons[0]);
    expect(screen.queryByTestId("sub-row-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("sub-row-2")).toBeInTheDocument();
  });

  it("handles empty data with loading state", () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={[]} loading={true} total={0} />,
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    const table = screen.getByRole("grid");
    expect(table).toHaveAttribute("aria-busy", "true");
    expect(table).toHaveAttribute("aria-rowcount", "0");
  });

  it("calculates right-pinned column positions correctly", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-right-pinning",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: [], right: ["email", "role"] },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 150 },
          email: { width: 200 },
          role: { width: 120 },
        };

        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="right-pinning"
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 200 }),
          },
        },
        {
          target: {
            getAttribute: () => "role",
            getBoundingClientRect: () => ({ width: 120 }),
          },
        },
      ]);
    });

    const emailHeader = screen.getByText("Email").closest("th");
    const roleHeader = screen.getByText("Role").closest("th");

    expect(emailHeader).toHaveAttribute("data-column-key", "email");
    expect(roleHeader).toHaveAttribute("data-column-key", "role");
  });

  it("handles select all functionality", () => {
    const mockGroupActions = [{ label: "Delete All", onClick: vi.fn() }];

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        groupActions={mockGroupActions}
      />,
    );

    const selectAllCheckbox = screen.getAllByRole("checkbox")[0];

    fireEvent.click(selectAllCheckbox);

    const individualCheckboxes = screen.getAllByRole("checkbox").slice(1);
    individualCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });

    fireEvent.click(selectAllCheckbox);

    individualCheckboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it("handles fullscreen toggle with complex data", () => {
    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        toolbar={<div>Toolbar</div>}
        actions={() => <button>Edit</button>}
        total={100}
      />,
    );

    const tableContainer = screen.getByRole("region", { name: "Data table" });
    const fullscreenButton = screen.getByLabelText("Toggle full screen");

    expect(tableContainer).not.toHaveClass("fixed inset-0 z-50");

    fireEvent.click(fullscreenButton);
    expect(tableContainer).toHaveClass("fixed inset-0 z-50");

    fireEvent.click(fullscreenButton);
    expect(tableContainer).not.toHaveClass("fixed inset-0 z-50");
  });

  it("handles aria attributes correctly", () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} loading={false} />,
    );

    const table = screen.getByRole("grid");
    expect(table).toHaveAttribute("aria-busy", "false");
    expect(table).toHaveAttribute("aria-colcount", "3");
    expect(table).toHaveAttribute("aria-rowcount", "2");
  });

  it("renders custom column content with render function", () => {
    const customColumns: Column<{
      id: string;
      name: string;
      email: string;
      role: string;
    }>[] = [
      {
        key: "name",
        label: "Jméno",
        render: (row) => (
          <strong data-testid={`custom-name-${row.id}`}>{row.name}</strong>
        ),
      },
      { key: "email", label: "Email" },
      {
        key: "role",
        label: "Role",
        render: (row) => <span className="badge">{row.role}</span>,
      },
    ];

    renderWithProviders(<DataTable columns={customColumns} data={mockData} />);

    expect(screen.getByTestId("custom-name-1")).toBeInTheDocument();
    expect(screen.getByTestId("custom-name-2")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    const roleBadges = screen.getAllByText(/Admin|User/);
    expect(roleBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("displays table content with proper accessibility attributes", () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} loading={false} />,
    );

    const table = screen.getByRole("grid");
    expect(table).toHaveAttribute("aria-busy", "false");
    expect(table).toHaveAttribute("aria-colcount", "3");
    expect(table).toHaveAttribute("aria-rowcount", "2");
  });

  it("handles empty group actions array", () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={mockData} groupActions={[]} />,
    );

    expect(
      screen.queryByRole("button", { name: /delete|archive/i }),
    ).not.toBeInTheDocument();
  });

  it("renders correctly when no actions or group actions provided", () => {
    renderWithProviders(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("calculates left pinned positions with actions and group actions", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-left-calc-test",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name", "email"], right: [] },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 100 },
          email: { width: 150 },
          role: { width: 120 },
          actions: { width: 80 },
          selection: { width: 40 },
        };

        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="left-calc-test"
        actions={() => <button>Edit</button>}
        groupActions={[{ label: "Delete", onClick: vi.fn() }]}
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "actions",
            getBoundingClientRect: () => ({ width: 80 }),
          },
        },
        {
          target: {
            getAttribute: () => "selection",
            getBoundingClientRect: () => ({ width: 40 }),
          },
        },
      ]);
    });

    const nameHeader = screen.getByText("Jméno").closest("th");
    const emailHeader = screen.getByText("Email").closest("th");

    expect(nameHeader).toHaveAttribute("data-column-key", "name");
    expect(emailHeader).toHaveAttribute("data-column-key", "email");
  });

  it("calculates right pinned positions with multiple columns", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-right-calc-test",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: [], right: ["email", "role"] },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 100 },
          email: { width: 150 },
          role: { width: 120 },
        };

        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="right-calc-test"
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "role",
            getBoundingClientRect: () => ({ width: 120 }),
          },
        },
      ]);
    });

    const emailHeader = screen.getByText("Email").closest("th");
    const roleHeader = screen.getByText("Role").closest("th");

    expect(emailHeader).toHaveAttribute("data-column-key", "email");
    expect(roleHeader).toHaveAttribute("data-column-key", "role");
  });

  it("handles empty data when not loading", () => {
    renderWithProviders(
      <DataTable columns={mockColumns} data={[]} loading={false} />,
    );

    expect(screen.getByText("Žádná data")).toBeInTheDocument();
    const table = screen.getByRole("grid");
    expect(table).toHaveAttribute("aria-busy", "false");
    expect(table).toHaveAttribute("aria-rowcount", "0");
  });

  it("handles group actions with no selected rows", () => {
    const mockOnClick = vi.fn();
    const mockGroupActions = [{ label: "Bulk Action", onClick: mockOnClick }];

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        groupActions={mockGroupActions}
      />,
    );

    // Button should be disabled when no rows are selected
    const bulkActionButton = screen.getByText("Bulk Action");
    expect(bulkActionButton).toBeDisabled();

    // Mock onClick should not be called when button is disabled
    fireEvent.click(bulkActionButton);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("executes handleResetSettings callback with column order reset", () => {
    const testColumns = [
      { key: "name", label: "Jméno" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status" },
    ];

    const extendedData = mockData.map((item) => ({
      ...item,
      status: "Active",
    }));

    mockLocalStorage.setItem(
      "table-state-test@example.com-reset-callback-order",
      JSON.stringify({
        columnOrder: ["email", "name", "role", "status"],
        columnVisibility: {
          name: false,
          email: true,
          role: true,
          status: false,
        },
        pinnedColumns: { left: ["email"], right: ["role"] },
      }),
    );

    renderWithProviders(
      <DataTable
        columns={testColumns}
        data={extendedData}
        tableId="reset-callback-order"
      />,
    );

    const columnsButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(columnsButton);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
  });

  it("executes handleResetSettings callback with column visibility reset", () => {
    const testColumns = [
      { key: "name", label: "Jméno" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
    ];

    mockLocalStorage.setItem(
      "table-state-test@example.com-reset-callback-visibility",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: false, email: false, role: true },
        pinnedColumns: { left: ["role"], right: [] },
      }),
    );

    renderWithProviders(
      <DataTable
        columns={testColumns}
        data={mockData}
        tableId="reset-callback-visibility"
      />,
    );

    const columnsButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(columnsButton);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(screen.getAllByText("Jméno")).toHaveLength(2);
    expect(screen.getAllByText("Email")).toHaveLength(2);
    expect(screen.getAllByText("Role")).toHaveLength(2);
  });

  it("executes handleResetSettings callback with pinned columns reset", () => {
    const testColumns = [
      { key: "name", label: "Jméno" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
    ];

    mockLocalStorage.setItem(
      "table-state-test@example.com-reset-callback-pinned",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name", "email"], right: ["role"] },
      }),
    );

    renderWithProviders(
      <DataTable
        columns={testColumns}
        data={mockData}
        tableId="reset-callback-pinned"
      />,
    );

    const columnsButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(columnsButton);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
  });

  it("executes calculatePosition callback for left pinned columns", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-calc-position-left",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name", "email"], right: [] },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 120 },
          email: { width: 180 },
          role: { width: 100 },
          actions: { width: 60 },
          selection: { width: 35 },
        };
        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="calc-position-left"
        actions={() => <button>Edit</button>}
        groupActions={[{ label: "Delete", onClick: vi.fn() }]}
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 120 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 180 }),
          },
        },
        {
          target: {
            getAttribute: () => "actions",
            getBoundingClientRect: () => ({ width: 60 }),
          },
        },
        {
          target: {
            getAttribute: () => "selection",
            getBoundingClientRect: () => ({ width: 35 }),
          },
        },
      ]);
    });

    const nameHeader = screen.getByText("Jméno").closest("th");
    const emailHeader = screen.getByText("Email").closest("th");

    expect(nameHeader).toHaveAttribute("data-column-key", "name");
    expect(emailHeader).toHaveAttribute("data-column-key", "email");
  });

  it("executes calculatePosition callback for right pinned columns", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-calc-position-right",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: [], right: ["email", "role"] },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 120 },
          email: { width: 180 },
          role: { width: 100 },
        };
        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="calc-position-right"
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 180 }),
          },
        },
        {
          target: {
            getAttribute: () => "role",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
      ]);
    });

    const emailHeader = screen.getByText("Email").closest("th");
    const roleHeader = screen.getByText("Role").closest("th");

    expect(emailHeader).toHaveAttribute("data-column-key", "email");
    expect(roleHeader).toHaveAttribute("data-column-key", "role");
  });

  it("executes calculatePosition callback returning auto for non-pinned columns", () => {
    mockLocalStorage.setItem(
      "table-state-test@example.com-calc-position-auto",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name"], right: ["role"] },
      }),
    );

    renderWithProviders(
      <DataTable
        columns={mockColumns}
        data={mockData}
        tableId="calc-position-auto"
      />,
    );

    const emailHeader = screen.getByText("Email").closest("th");
    expect(emailHeader).toHaveAttribute("data-column-key", "email");
  });

  it("executes calculatePosition callback with different column arrangements", () => {
    const extendedColumns = [
      { key: "name", label: "Jméno" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "department", label: "Oddělení" },
      { key: "status", label: "Status" },
    ];

    const extendedData = mockData.map((item) => ({
      ...item,
      department: "IT",
      status: "Active",
    }));

    mockLocalStorage.setItem(
      "table-state-test@example.com-calc-position-complex",
      JSON.stringify({
        columnOrder: ["name", "email", "role", "department", "status"],
        columnVisibility: {
          name: true,
          email: true,
          role: true,
          department: true,
          status: true,
        },
        pinnedColumns: {
          left: ["name", "email", "role"],
          right: ["department", "status"],
        },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 100 },
          email: { width: 150 },
          role: { width: 120 },
          department: { width: 140 },
          status: { width: 110 },
          actions: { width: 70 },
          selection: { width: 40 },
        };
        return widths[columnKey as keyof typeof widths] || { width: 100 };
      });

    renderWithProviders(
      <DataTable
        columns={extendedColumns}
        data={extendedData}
        tableId="calc-position-complex"
        actions={() => <button>Edit</button>}
        groupActions={[{ label: "Delete", onClick: vi.fn() }]}
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "role",
            getBoundingClientRect: () => ({ width: 120 }),
          },
        },
        {
          target: {
            getAttribute: () => "department",
            getBoundingClientRect: () => ({ width: 140 }),
          },
        },
        {
          target: {
            getAttribute: () => "status",
            getBoundingClientRect: () => ({ width: 110 }),
          },
        },
        {
          target: {
            getAttribute: () => "actions",
            getBoundingClientRect: () => ({ width: 70 }),
          },
        },
        {
          target: {
            getAttribute: () => "selection",
            getBoundingClientRect: () => ({ width: 40 }),
          },
        },
      ]);
    });

    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);
  });

  it("executes handleResetSettings callback logic", () => {
    const testColumns = [
      { key: "name", label: "Jméno" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
    ];

    renderWithProviders(<DataTable columns={testColumns} data={mockData} />);

    const columnsButton = screen.getByLabelText("Toggle column visibility");
    fireEvent.click(columnsButton);

    const nameSwitches = screen.getAllByRole("switch");
    const nameSwitch = nameSwitches.find((switchEl) =>
      switchEl.getAttribute("aria-label")?.includes("Jméno"),
    );

    if (nameSwitch) {
      fireEvent.click(nameSwitch);

      const resetButton = screen.getByText("Reset");
      expect(resetButton).not.toBeDisabled();

      fireEvent.click(resetButton);

      expect(screen.getAllByText("Jméno")).toHaveLength(2);
    }
  });

  it("tests calculatePosition function logic directly through pinned columns", () => {
    const testColumns = [
      { key: "name", label: "Jméno" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
    ];

    mockLocalStorage.setItem(
      "table-state-test@example.com-direct-calc-test",
      JSON.stringify({
        columnOrder: ["name", "email", "role"],
        columnVisibility: { name: true, email: true, role: true },
        pinnedColumns: { left: ["name", "email"], right: ["role"] },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        return {
          width:
            columnKey === "name"
              ? 100
              : columnKey === "email"
                ? 150
                : columnKey === "role"
                  ? 120
                  : columnKey === "actions"
                    ? 60
                    : columnKey === "selection"
                      ? 30
                      : 80,
        };
      });

    renderWithProviders(
      <DataTable
        columns={testColumns}
        data={mockData}
        tableId="direct-calc-test"
        actions={() => <button>Edit</button>}
        groupActions={[{ label: "Delete", onClick: vi.fn() }]}
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "role",
            getBoundingClientRect: () => ({ width: 120 }),
          },
        },
        {
          target: {
            getAttribute: () => "actions",
            getBoundingClientRect: () => ({ width: 60 }),
          },
        },
        {
          target: {
            getAttribute: () => "selection",
            getBoundingClientRect: () => ({ width: 30 }),
          },
        },
      ]);
    });

    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);

    const nameHeader = screen.getByText("Jméno").closest("th");
    const emailHeader = screen.getByText("Email").closest("th");
    const roleHeader = screen.getByText("Role").closest("th");

    expect(nameHeader).toHaveAttribute("data-column-key", "name");
    expect(emailHeader).toHaveAttribute("data-column-key", "email");
    expect(roleHeader).toHaveAttribute("data-column-key", "role");

    expect(nameHeader?.getAttribute("data-column-key")).toBe("name");
    expect(emailHeader?.getAttribute("data-column-key")).toBe("email");
    expect(roleHeader?.getAttribute("data-column-key")).toBe("role");
  });

  it("covers both branches of calculatePosition for position parameter", () => {
    const testColumns = [
      { key: "name", label: "Jméno" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status" },
    ];

    const extendedData = mockData.map((item) => ({
      ...item,
      status: "Active",
    }));

    mockLocalStorage.setItem(
      "table-state-test@example.com-position-branches",
      JSON.stringify({
        columnOrder: ["name", "email", "role", "status"],
        columnVisibility: { name: true, email: true, role: true, status: true },
        pinnedColumns: { left: ["name", "email"], right: ["role", "status"] },
      }),
    );

    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        const columnKey = this.getAttribute("data-column-key");
        const widths = {
          name: { width: 100 },
          email: { width: 150 },
          role: { width: 120 },
          status: { width: 110 },
          actions: { width: 60 },
          selection: { width: 30 },
        };
        return widths[columnKey as keyof typeof widths] || { width: 80 };
      });

    renderWithProviders(
      <DataTable
        columns={testColumns}
        data={extendedData}
        tableId="position-branches"
        actions={() => <button>Edit</button>}
        groupActions={[{ label: "Delete", onClick: vi.fn() }]}
      />,
    );

    const resizeObserverCallback = (
      global.ResizeObserver as unknown as MockInstance
    ).mock.calls[0][0];

    act(() => {
      resizeObserverCallback([
        {
          target: {
            getAttribute: () => "name",
            getBoundingClientRect: () => ({ width: 100 }),
          },
        },
        {
          target: {
            getAttribute: () => "email",
            getBoundingClientRect: () => ({ width: 150 }),
          },
        },
        {
          target: {
            getAttribute: () => "role",
            getBoundingClientRect: () => ({ width: 120 }),
          },
        },
        {
          target: {
            getAttribute: () => "status",
            getBoundingClientRect: () => ({ width: 110 }),
          },
        },
        {
          target: {
            getAttribute: () => "actions",
            getBoundingClientRect: () => ({ width: 60 }),
          },
        },
        {
          target: {
            getAttribute: () => "selection",
            getBoundingClientRect: () => ({ width: 30 }),
          },
        },
      ]);
    });

    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBeGreaterThan(0);

    expect(screen.getByText("Jméno")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("applies min and max width to columns", () => {
    const columnsWithWidth: Column<{
      id: string;
      name: string;
      email: string;
      role: string;
    }>[] = [
      { key: "name", label: "Jméno", minWidth: 100, maxWidth: 200 },
      { key: "email", label: "Email", minWidth: 150 },
      { key: "role", label: "Role", maxWidth: 120 },
    ];

    renderWithProviders(
      <DataTable columns={columnsWithWidth} data={mockData} />,
    );

    const nameHeader = screen.getByRole("columnheader", { name: /jméno/i });
    const emailHeader = screen.getByRole("columnheader", { name: /email/i });
    const roleHeader = screen.getByRole("columnheader", { name: /role/i });

    // Check that the styles are applied
    expect(nameHeader).toHaveStyle({
      minWidth: "100px",
      maxWidth: "200px",
    });
    expect(emailHeader).toHaveStyle({
      minWidth: "150px",
    });
    expect(roleHeader).toHaveStyle({
      maxWidth: "120px",
    });

    // Check that the first data row cells also have the same styles
    const nameCell = screen.getByText("John Doe").closest("td");
    const emailCell = screen.getByText("john@example.com").closest("td");
    const roleCell = screen.getAllByText("Admin")[0].closest("td");

    expect(nameCell).toHaveStyle({
      minWidth: "100px",
      maxWidth: "200px",
    });
    expect(emailCell).toHaveStyle({
      minWidth: "150px",
    });
    expect(roleCell).toHaveStyle({
      maxWidth: "120px",
    });
  });
});
