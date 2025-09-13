import { Column, GroupAction } from "../../../../components/ui/data-table";
import { fireEvent, renderWithProviders, screen } from "../../../test-utils";
import { getDictionary } from "../../../../dictionaries";
import { TableBody } from "../../../../components/ui/data-table/table-body";

describe("TableBody Component", () => {
  const dict = getDictionary();

  const mockColumns: Column<unknown>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const mockData = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  const mockCalculatePosition = vi.fn().mockImplementation((_, position) => {
    if (position === "left") return "0px";
    return "0px";
  });

  const mockToggleRowExpansion = vi.fn();
  const mockToggleRowSelection = vi.fn();
  const mockActions = vi.fn().mockReturnValue(<button>Actions</button>);
  const mockRenderSubRow = vi.fn().mockReturnValue(<div>Sub row content</div>);

  const defaultProps = {
    calculatePosition: mockCalculatePosition,
    data: mockData,
    dict: dict,
    expandedRows: new Set<string>(),
    filters: {},
    pinnedColumns: { left: [], right: [] },
    selectedRows: [],
    sortedVisibleColumns: mockColumns,
    toggleRowExpansion: mockToggleRowExpansion,
    toggleRowSelection: mockToggleRowSelection,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders rows with data correctly", () => {
    renderWithProviders(
      <table>
        <TableBody {...defaultProps} />
      </table>,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders no data message when data is empty and not loading", () => {
    renderWithProviders(
      <table>
        <TableBody {...defaultProps} data={[]} loading={false} />
      </table>,
    );
    expect(screen.getByText("Žádná data")).toBeInTheDocument();
  });

  it("renders loading spinner when data is empty and loading is true", () => {
    renderWithProviders(
      <table>
        <TableBody {...defaultProps} data={[]} loading={true} />
      </table>,
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    const skeletonRows = document.querySelectorAll("tr");
    expect(skeletonRows.length).toBe(11);
  });

  it("renders expansion controls when renderSubRow is provided", () => {
    renderWithProviders(
      <table>
        <TableBody {...defaultProps} renderSubRow={mockRenderSubRow} />
      </table>,
    );

    const expandButtons = screen.getAllByRole("button", {
      name: /rozbalit řádek/i,
    });
    expect(expandButtons.length).toBe(2);
  });

  it("toggles row expansion when expand button is clicked", () => {
    renderWithProviders(
      <table>
        <TableBody {...defaultProps} renderSubRow={mockRenderSubRow} />
      </table>,
    );

    const expandButtons = screen.getAllByRole("button", {
      name: /rozbalit řádek/i,
    });
    fireEvent.click(expandButtons[0]);

    expect(mockToggleRowExpansion).toHaveBeenCalledWith("1");
  });

  it("renders sub row content when row is expanded", () => {
    const expandedRows = new Set<string>(["1"]);
    renderWithProviders(
      <table>
        <TableBody
          {...defaultProps}
          expandedRows={expandedRows}
          renderSubRow={mockRenderSubRow}
        />
      </table>,
    );

    expect(screen.getByText("Sub row content")).toBeInTheDocument();
    expect(mockRenderSubRow).toHaveBeenCalledWith(mockData[0]);
  });

  it("renders checkboxes for row selection when groupActions is provided", () => {
    const mockGroupActions: GroupAction<unknown>[] = [
      { label: "Delete", onClick: vi.fn() },
    ];

    renderWithProviders(
      <table>
        <TableBody {...defaultProps} groupActions={mockGroupActions} />
      </table>,
    );

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
  });

  it("calls toggleRowSelection when checkbox is clicked", () => {
    const mockGroupActions: GroupAction<unknown>[] = [
      { label: "Delete", onClick: vi.fn() },
    ];

    renderWithProviders(
      <table>
        <TableBody {...defaultProps} groupActions={mockGroupActions} />
      </table>,
    );

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(checkboxes[0]);

    expect(mockToggleRowSelection).toHaveBeenCalledWith(mockData[0]);
  });

  it("renders action column when actions prop is provided", () => {
    renderWithProviders(
      <table>
        <TableBody {...defaultProps} actions={mockActions} />
      </table>,
    );

    expect(screen.getAllByText("Actions").length).toBe(2);
    expect(mockActions).toHaveBeenCalledTimes(2);
  });

  it("applies the correct colspan to the 'no data' cell", () => {
    renderWithProviders(
      <table>
        <TableBody {...defaultProps} data={[]} loading={false} />
      </table>,
    );

    const td = screen.getByText("Žádná data").closest("td");
    expect(td).toHaveAttribute("colspan", "3");
  });

  it("applies proper styles to pinned columns", () => {
    renderWithProviders(
      <table>
        <TableBody
          {...defaultProps}
          pinnedColumns={{ left: ["name"], right: [] }}
        />
      </table>,
    );

    const nameCell = screen.getByText("John Doe").closest("td");
    expect(nameCell).toHaveClass("sticky");
  });

  it("applies correct colspan to expanded row content", () => {
    const expandedRows = new Set<string>(["1"]);
    renderWithProviders(
      <table>
        <TableBody
          {...defaultProps}
          expandedRows={expandedRows}
          renderSubRow={mockRenderSubRow}
        />
      </table>,
    );

    const expandedRowCell = screen.getByText("Sub row content").closest("td");
    expect(expandedRowCell).toHaveAttribute("colspan", "4");
  });

  it("truncates long text and renders with popover", async () => {
    const longTextData = [
      {
        id: "1",
        name: "A".repeat(100),
        email: "john@example.com",
        role: "Admin",
      },
    ];

    renderWithProviders(
      <table>
        <TableBody {...defaultProps} data={longTextData} />
      </table>,
    );

    const truncatedText = screen.getByText(/AAAAA.*\.\.\./);
    expect(truncatedText.textContent).toContain("A".repeat(80));
    expect(truncatedText.textContent).toContain("...");

    const popoverContainer = document.querySelector(".popover");
    expect(popoverContainer).toBeInTheDocument();

    fireEvent.mouseEnter(popoverContainer!);

    const popoverContent = await screen.findByRole("dialog");
    expect(popoverContent.textContent).toBe("A".repeat(100));
  });

  it("highlights text that matches filter criteria", () => {
    renderWithProviders(
      <table>
        <TableBody {...defaultProps} filters={{ name: "John" }} />
      </table>,
    );

    const cells = document.querySelectorAll("td");
    let foundHighlightedCell = false;

    for (const cell of cells) {
      if (cell.innerHTML.includes("<b>John</b>")) {
        foundHighlightedCell = true;
        break;
      }
    }

    expect(foundHighlightedCell).toBe(true);
  });

  it("uses custom render function for columns when provided", () => {
    const customColumns: Column<unknown>[] = [
      {
        key: "custom",
        label: "Custom",
        render: () => <span data-testid="custom-content">Custom Content</span>,
      },
      ...mockColumns,
    ];

    renderWithProviders(
      <table>
        <TableBody {...defaultProps} sortedVisibleColumns={customColumns} />
      </table>,
    );

    expect(screen.getAllByTestId("custom-content").length).toBe(2);
  });

  it("renders custom column content correctly", () => {
    const customColumns: Column<unknown>[] = [
      {
        key: "custom",
        label: "Custom",
        render: () => <div data-testid="custom-content">Custom</div>,
      },
      ...mockColumns,
    ];

    renderWithProviders(
      <table>
        <TableBody {...defaultProps} sortedVisibleColumns={customColumns} />
      </table>,
    );

    expect(screen.getAllByTestId("custom-content").length).toBe(2);
  });

  it("handles complex pinning with multiple actions and group actions", () => {
    const groupActions: GroupAction<unknown>[] = [
      { label: "Delete", onClick: vi.fn() },
    ];

    renderWithProviders(
      <table>
        <TableBody
          {...defaultProps}
          actions={mockActions}
          groupActions={groupActions}
          pinnedColumns={{ left: ["name"], right: ["role"] }}
        />
      </table>,
    );

    const cells = screen.getAllByRole("cell");
    expect(cells.length).toBeGreaterThan(0);

    expect(screen.getAllByText("Actions").length).toBe(2);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(2);
  });

  it("handles row selection with complex data", () => {
    const selectedRows = [mockData[0]];

    renderWithProviders(
      <table>
        <TableBody
          {...defaultProps}
          selectedRows={selectedRows}
          groupActions={[{ label: "Delete", onClick: vi.fn() }]}
        />
      </table>,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();

    fireEvent.click(checkboxes[1]);
    expect(mockToggleRowSelection).toHaveBeenCalledWith(mockData[1]);
  });

  it("calculates pinned positions correctly for left and right columns", () => {
    const leftCalculatePosition = vi
      .fn()
      .mockImplementation((key, position) => {
        if (position === "left" && key === "name") return "50px";
        if (position === "right" && key === "role") return "100px";
        return "auto";
      });

    renderWithProviders(
      <table>
        <TableBody
          {...defaultProps}
          calculatePosition={leftCalculatePosition}
          pinnedColumns={{ left: ["name"], right: ["role"] }}
        />
      </table>,
    );

    expect(leftCalculatePosition).toHaveBeenCalledWith("name", "left");
    expect(leftCalculatePosition).toHaveBeenCalledWith("role", "right");
  });

  it("handles expand/collapse with multiple expanded rows", () => {
    const expandedRows = new Set(["1", "2"]);

    renderWithProviders(
      <table>
        <TableBody
          {...defaultProps}
          renderSubRow={mockRenderSubRow}
          expandedRows={expandedRows}
        />
      </table>,
    );

    expect(screen.getAllByText("Sub row content").length).toBe(2);

    const collapseButtons = screen.getAllByLabelText("Sbalit řádek");
    expect(collapseButtons.length).toBe(2);

    fireEvent.click(collapseButtons[0]);
    expect(mockToggleRowExpansion).toHaveBeenCalledWith("1");
  });

  it("renders correctly with filtered data", () => {
    const filters = { name: "John", role: "Admin" };

    renderWithProviders(
      <table>
        <TableBody {...defaultProps} filters={filters} data={[mockData[0]]} />
      </table>,
    );

    expect(
      screen.getByText((_, element) => {
        return element?.textContent === "John Doe";
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("handles actions column with complex positioning", () => {
    const actionsColumn = vi.fn().mockImplementation((row) => (
      <div data-testid={`actions-${row.id}`}>
        <button>Edit {row.name}</button>
        <button>Delete {row.name}</button>
      </div>
    ));

    renderWithProviders(
      <table>
        <TableBody
          {...defaultProps}
          actions={actionsColumn}
          pinnedColumns={{ left: ["name"], right: [] }}
        />
      </table>,
    );

    expect(screen.getByTestId("actions-1")).toBeInTheDocument();
    expect(screen.getByTestId("actions-2")).toBeInTheDocument();
    expect(screen.getByText("Edit John Doe")).toBeInTheDocument();
    expect(screen.getByText("Delete Jane Smith")).toBeInTheDocument();
  });

  it("handles empty data state with custom message", () => {
    const customDict = {
      ...dict,
      dataTable: {
        ...dict.dataTable,
        noData: "Žádná data k zobrazení",
      },
    } as Awaited<ReturnType<typeof getDictionary>>;

    renderWithProviders(
      <table>
        <TableBody {...defaultProps} data={[]} dict={customDict} />
      </table>,
    );

    expect(screen.getByText("Žádná data k zobrazení")).toBeInTheDocument();
  });

  it("renders sub rows with different content for each row", () => {
    const mockRenderSubRow = vi.fn((row) => (
      <div data-testid={`sub-row-${row.id}`}>Sub content for {row.name}</div>
    ));

    renderWithProviders(
      <table>
        <TableBody
          actions={() => <button>Edit</button>}
          calculatePosition={(_columnKey, position) => {
            if (position === "left") return "0px";
            return "auto";
          }}
          data={mockData}
          dict={getDictionary()}
          expandedRows={new Set(["1", "2"])}
          filters={{}}
          groupActions={[{ label: "Delete", onClick: vi.fn() }]}
          loading={false}
          pinnedColumns={{ left: ["name"], right: ["role"] }}
          renderSubRow={mockRenderSubRow}
          selectedRows={[]}
          sortedVisibleColumns={mockColumns}
          toggleRowExpansion={vi.fn()}
          toggleRowSelection={vi.fn()}
        />
      </table>,
    );

    expect(screen.getByTestId("sub-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("sub-row-2")).toBeInTheDocument();
    expect(screen.getByText("Sub content for John Doe")).toBeInTheDocument();
    expect(screen.getByText("Sub content for Jane Smith")).toBeInTheDocument();
  });

  it("applies hover styles to pinned columns correctly", () => {
    renderWithProviders(
      <table>
        <TableBody
          actions={() => <button>Edit</button>}
          calculatePosition={(columnKey, position) => {
            if (position === "left" && columnKey === "name") return "0px";
            if (position === "right" && columnKey === "role") return "0px";
            return "auto";
          }}
          data={mockData}
          dict={getDictionary()}
          expandedRows={new Set()}
          filters={{}}
          groupActions={[]}
          loading={false}
          pinnedColumns={{ left: ["name"], right: ["role"] }}
          renderSubRow={(row) => <div>Sub {row.id}</div>}
          selectedRows={[]}
          sortedVisibleColumns={mockColumns}
          toggleRowExpansion={vi.fn()}
          toggleRowSelection={vi.fn()}
        />
      </table>,
    );

    const rows = screen.getAllByRole("row");
    const dataRows = rows.slice(1);

    dataRows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      cells.forEach((cell) => {
        const columnKey = cell.getAttribute("data-column-key");
        if (columnKey === "name" || columnKey === "role") {
          expect(cell).toHaveClass("group-hover:bg-gray-50");
          expect(cell).toHaveClass("dark:group-hover:bg-gray-800");
        }
      });
    });
  });
});
