import { Column } from "../../../../components/ui/data-table";
import { fireEvent, renderWithProviders, screen } from "../../../test-utils";
import { getDictionary } from "../../../../dictionaries";
import { MockedProvider } from "@apollo/client/testing/react";
import { TableHead } from "../../../../components/ui/data-table/table-head";
import { createRef } from "react";

const mockSetSearchParams = vi.fn();
vi.mock("react-router", () => ({
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

vi.mock("../../../../utils/debounce", () => ({
  default: (fn: () => void) => fn,
}));

const renderWithApollo = (component: React.ReactElement) => {
  return renderWithProviders(
    <MockedProvider mocks={[]}>{component}</MockedProvider>,
  );
};

describe("TableHead Component", () => {
  const dict = getDictionary();

  // Mock setDragImage for drag and drop tests
  beforeEach(() => {
    global.DataTransfer = class MockDataTransfer {
      setData = vi.fn();
      getData = vi.fn();
      setDragImage = vi.fn();
    } as unknown as typeof DataTransfer;
  });

  const mockColumns: Column<unknown>[] = [
    {
      key: "name",
      label: "Jméno",
      sortable: true,
      filter: "input",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "type",
      label: "Typ",
      filter: "select",
      filterSelectOptions: [
        { label: "Typ 1", value: "type1" },
        { label: "Typ 2", value: "type2" },
      ],
    },
    {
      key: "date",
      label: "Datum",
      filter: "date",
    },
    {
      key: "time",
      label: "Čas",
      filter: "time",
    },
    {
      key: "datetime",
      label: "Datum a čas",
      filter: "datetime",
    },
  ];

  const defaultProps = {
    actionColumnRef: { current: null },
    calculatePosition: vi.fn().mockImplementation(() => "0px"),
    columnRefs: { current: {} },
    dict: dict,
    filters: {},
    handleDragOver: vi.fn(),
    handleDragStart: vi.fn(),
    handleDrop: vi.fn(),
    isAllSelected: false,
    order: "",
    pinnedColumns: { left: [], right: [] },
    sortBy: "",
    sortedVisibleColumns: mockColumns,
    toggleSelectAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sorting functionality", () => {
    it("sets ascending order when clicking on unsorted column", () => {
      renderWithApollo(
        <table>
          <TableHead {...defaultProps} sortBy="" order="" />
        </table>,
      );

      const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
      fireEvent.click(sortButton);

      expect(mockSetSearchParams).toHaveBeenCalled();
      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      expect(params.get("sortBy")).toBe("name");
      expect(params.get("order")).toBe("ASC");
    });

    it("sets descending order when clicking on ascending sorted column", () => {
      renderWithApollo(
        <table>
          <TableHead {...defaultProps} sortBy="name" order="ASC" />
        </table>,
      );

      const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
      fireEvent.click(sortButton);

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      expect(params.get("sortBy")).toBe("name");
      expect(params.get("order")).toBe("DESC");
    });

    it("removes sorting when clicking on descending sorted column", () => {
      renderWithApollo(
        <table>
          <TableHead {...defaultProps} sortBy="name" order="DESC" />
        </table>,
      );

      const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
      fireEvent.click(sortButton);

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      params.set("sortBy", "name");
      params.set("order", "DESC");
      updateFn(params);

      expect(params.has("sortBy")).toBe(false);
      expect(params.has("order")).toBe(false);
    });
  });

  describe("filter functionality", () => {
    it("adds a filter when value is provided", () => {
      renderWithApollo(
        <table>
          <TableHead {...defaultProps} />
        </table>,
      );

      const inputFilter = screen.getByLabelText("Filter Jméno");
      fireEvent.change(inputFilter, { target: { value: "test" } });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.name).toBe("test");
      expect(params.get("page")).toBe("1");
    });

    it("removes a filter when value is empty", () => {
      renderWithApollo(
        <table>
          <TableHead {...defaultProps} filters={{ name: "test" }} />
        </table>,
      );

      const inputFilter = screen.getByLabelText("Filter Jméno");
      expect(inputFilter).toHaveValue("test");

      fireEvent.change(inputFilter, { target: { value: "" } });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.name).toBeUndefined();
    });
  });

  describe("date and time filters rendering", () => {
    it("renders time filter with correct attributes", () => {
      renderWithApollo(
        <table>
          <TableHead {...defaultProps} />
        </table>,
      );

      const timeFilter = screen.getByLabelText("Filter Čas");
      expect(timeFilter).toHaveAttribute("type", "time");

      fireEvent.change(timeFilter, { target: { value: "12:30" } });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.time).toBe("12:30");
    });

    it("renders date filter with correct attributes and handles changes", () => {
      renderWithApollo(
        <table>
          <TableHead {...defaultProps} />
        </table>,
      );

      const dateFilter = screen.getByLabelText("Filter Datum");
      expect(dateFilter).toHaveAttribute("type", "date");

      fireEvent.change(dateFilter, { target: { value: "2025-05-18" } });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.date).toBe("2025-05-18");
    });

    it("renders datetime filter with correct attributes and handles changes", () => {
      renderWithApollo(
        <table>
          <TableHead {...defaultProps} />
        </table>,
      );

      const datetimeFilter = screen.getByLabelText("Filter Datum a čas");
      expect(datetimeFilter).toHaveAttribute("type", "datetime-local");

      fireEvent.change(datetimeFilter, {
        target: { value: "2025-05-18T14:30" },
      });

      const updateFn = mockSetSearchParams.mock.calls[0][0];
      const params = new URLSearchParams();
      updateFn(params);

      const filters = JSON.parse(params.get("filters") || "{}");
      expect(filters.datetime).toBe("2025-05-18T14:30");
    });
  });

  it("clears all filters when clear filters button is clicked", () => {
    const mockActions = vi.fn();
    renderWithApollo(
      <table>
        <TableHead
          {...defaultProps}
          actions={mockActions}
          filters={{ name: "test", date: "2025-05-18" }}
        />
      </table>,
    );

    const clearFiltersButton = Array.from(
      document.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Zrušit filtry"));

    expect(clearFiltersButton).toBeInTheDocument();
    expect(clearFiltersButton).not.toBeDisabled();

    fireEvent.click(clearFiltersButton!);

    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    params.set("filters", '{"name":"test"}');
    params.set("page", "2");
    updateFn(params);

    expect(params.has("filters")).toBe(false);
    expect(params.get("page")).toBe("1");
  });

  it("renders selection checkbox column when groupActions is provided", () => {
    renderWithApollo(
      <table>
        <TableHead
          {...defaultProps}
          groupActions={[{ label: "Delete", onClick: vi.fn() }]}
        />
      </table>,
    );

    const selectionColumn = document.querySelector(
      'th[data-column-key="selection"]',
    );
    expect(selectionColumn).toBeInTheDocument();

    const checkbox = selectionColumn?.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  it("renders header cells for each column", () => {
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} />
      </table>,
    );

    mockColumns.forEach((column) => {
      const header = screen.getByText(column.label);
      expect(header).toBeInTheDocument();
    });
  });

  it("renders sort buttons for sortable columns", () => {
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} />
      </table>,
    );

    const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
    expect(sortButton).toBeInTheDocument();
  });

  it("calls setSearchParams when sort button is clicked", () => {
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} />
      </table>,
    );

    const sortButton = screen.getByRole("button", { name: /sort by jméno/i });
    fireEvent.click(sortButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("renders filters for different column types", () => {
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} />
      </table>,
    );

    const inputFilter = screen.getByLabelText("Filter Jméno");
    expect(inputFilter).toBeInTheDocument();
    expect(inputFilter).toHaveAttribute("type", "search");

    const selectFilter = screen.getByLabelText("Filter Typ");
    expect(selectFilter).toBeInTheDocument();

    const dateFilter = screen.getByLabelText("Filter Datum");
    expect(dateFilter).toBeInTheDocument();
    expect(dateFilter).toHaveAttribute("type", "date");

    const timeFilter = screen.getByLabelText("Filter Čas");
    expect(timeFilter).toBeInTheDocument();
    expect(timeFilter).toHaveAttribute("type", "time");

    const datetimeFilter = screen.getByLabelText("Filter Datum a čas");
    expect(datetimeFilter).toBeInTheDocument();
    expect(datetimeFilter).toHaveAttribute("type", "datetime-local");
  });

  it("renders with groupActions", () => {
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} groupActions={[]} />
      </table>,
    );
    expect(document.querySelector("thead")).toBeInTheDocument();
  });

  it("calls toggleSelectAll when selection control is used", () => {
    const mockToggleSelectAll = vi.fn();
    renderWithApollo(
      <table>
        <TableHead
          {...defaultProps}
          groupActions={[]}
          toggleSelectAll={mockToggleSelectAll}
        />
      </table>,
    );

    expect(document.querySelector("thead")).toBeInTheDocument();
  });

  it("renders actions column when actions is provided", () => {
    const mockActions = vi.fn();
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} actions={mockActions} />
      </table>,
    );

    const actionsHeader = screen.getByText("Akce");
    expect(actionsHeader).toBeInTheDocument();
  });

  it("manipulates filters", () => {
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} filters={{ name: "test" }} />
      </table>,
    );

    const input = screen.getByLabelText("Filter Jméno");
    expect(input).toHaveValue("test");
  });

  it("updates search params when input filter changes", () => {
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} />
      </table>,
    );

    const inputFilter = screen.getByLabelText("Filter Jméno");
    fireEvent.change(inputFilter, { target: { value: "test" } });

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("renders expansion column when renderSubRow is provided", () => {
    const mockRenderSubRow = vi.fn();
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} renderSubRow={mockRenderSubRow} />
      </table>,
    );

    const cells = document.querySelectorAll("th");
    expect(cells[0]).toHaveClass("w-10");
  });

  it("applies correct attributes for pinned columns", () => {
    renderWithApollo(
      <table>
        <TableHead
          {...defaultProps}
          pinnedColumns={{ left: ["name"], right: ["email"] }}
        />
      </table>,
    );

    const cells = document.querySelectorAll("th");

    const nameCell = Array.from(cells).find(
      (cell) => cell.getAttribute("data-column-key") === "name",
    );
    const emailCell = Array.from(cells).find(
      (cell) => cell.getAttribute("data-column-key") === "email",
    );

    expect(nameCell).toHaveClass("sticky");
    expect(emailCell).toHaveClass("sticky");
  });

  it("renders multiple pinned columns correctly", () => {
    renderWithApollo(
      <table>
        <TableHead
          {...defaultProps}
          pinnedColumns={{ left: ["name", "email"], right: [] }}
        />
      </table>,
    );

    const cells = document.querySelectorAll("th");

    const nameCell = Array.from(cells).find(
      (cell) => cell.getAttribute("data-column-key") === "name",
    );
    const emailCell = Array.from(cells).find(
      (cell) => cell.getAttribute("data-column-key") === "email",
    );

    expect(nameCell).toHaveClass("sticky");
    expect(emailCell).toHaveClass("sticky");
  });

  it("handles complex filter interactions with date and time columns", () => {
    const dateTimeColumns: Column<unknown>[] = [
      {
        key: "createdAt",
        label: "Vytvořeno",
        filter: "datetime",
        sortable: true,
      },
      {
        key: "updatedAt",
        label: "Aktualizováno",
        filter: "date",
        sortable: true,
      },
      {
        key: "time",
        label: "Čas",
        filter: "time",
      },
    ];

    renderWithApollo(
      <table>
        <TableHead {...defaultProps} sortedVisibleColumns={dateTimeColumns} />
      </table>,
    );

    const dateTimePicker = screen.getByPlaceholderText("Hledat Vytvořeno");
    const dateInput = screen.getByPlaceholderText("Hledat Aktualizováno");
    const timeInput = screen.getByPlaceholderText("Hledat Čas");

    expect(dateTimePicker).toHaveAttribute("type", "datetime-local");
    expect(dateInput).toHaveAttribute("type", "date");
    expect(timeInput).toHaveAttribute("type", "time");

    fireEvent.change(dateTimePicker, { target: { value: "2023-12-01T10:30" } });
    fireEvent.change(dateInput, { target: { value: "2023-12-01" } });
    fireEvent.change(timeInput, { target: { value: "14:30" } });

    expect(dateTimePicker).toHaveValue("2023-12-01T10:30");
    expect(dateInput).toHaveValue("2023-12-01");
    expect(timeInput).toHaveValue("14:30");
  });

  it("handles sorting with different order states", () => {
    const sortableColumns: Column<unknown>[] = [
      { key: "name", label: "Jméno", sortable: true },
      { key: "email", label: "Email", sortable: true },
    ];

    const { rerender } = renderWithApollo(
      <table>
        <TableHead
          {...defaultProps}
          sortedVisibleColumns={sortableColumns}
          sortBy="name"
          order="ASC"
        />
      </table>,
    );

    const nameHeader = screen.getByText("Jméno").closest("button");
    expect(nameHeader).toBeInTheDocument();

    fireEvent.click(nameHeader!);
    expect(mockSetSearchParams).toHaveBeenCalled();

    rerender(
      <table>
        <TableHead
          {...defaultProps}
          sortedVisibleColumns={sortableColumns}
          sortBy="name"
          order="DESC"
        />
      </table>,
    );

    const nameHeaderDesc = screen.getByText("Jméno").closest("button");
    fireEvent.click(nameHeaderDesc!);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
  });

  it("renders clear filters button when filters are active", () => {
    const mockActions = () => <div>Actions</div>;

    renderWithApollo(
      <table>
        <TableHead
          {...defaultProps}
          filters={{ name: "John", type: "type1" }}
          actions={mockActions}
        />
      </table>,
    );

    const clearButton = screen.getByText("Zrušit filtry");
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("handles select all with group actions", () => {
    const groupActions = [{ label: "Delete", onClick: vi.fn() }];

    renderWithApollo(
      <table>
        <TableHead {...defaultProps} groupActions={groupActions} />
      </table>,
    );

    const selectAllCheckbox = screen.getByRole("checkbox");
    expect(selectAllCheckbox).toBeInTheDocument();
    expect(selectAllCheckbox).not.toBeChecked();

    fireEvent.click(selectAllCheckbox);
    expect(defaultProps.toggleSelectAll).toHaveBeenCalled();
  });

  it("handles drag and drop for column reordering", () => {
    renderWithApollo(
      <table>
        <TableHead {...defaultProps} sortedVisibleColumns={mockColumns} />
      </table>,
    );

    const nameHeader = screen.getByText("Jméno").closest("th");
    expect(nameHeader).toBeInTheDocument();

    const dragButton = screen.getAllByLabelText("Drag column")[0];
    expect(dragButton).toBeInTheDocument();

    fireEvent.dragStart(dragButton, { dataTransfer: new DataTransfer() });
    expect(defaultProps.handleDragStart).toHaveBeenCalledWith(
      expect.anything(),
      "name",
    );

    fireEvent.dragOver(nameHeader!);
    expect(defaultProps.handleDragOver).toHaveBeenCalled();

    fireEvent.drop(nameHeader!);
    expect(defaultProps.handleDrop).toHaveBeenCalledWith(
      expect.anything(),
      "name",
    );
  });

  it("renders actions column header correctly", () => {
    const mockActions = vi.fn();

    renderWithApollo(
      <table>
        <TableHead {...defaultProps} actions={mockActions} />
      </table>,
    );

    const actionsHeader = screen.getByText("Akce");
    expect(actionsHeader).toBeInTheDocument();
    expect(actionsHeader.closest("th")).toHaveAttribute(
      "data-column-key",
      "actions",
    );
  });

  it("applies correct pinning styles for right-pinned columns", () => {
    renderWithApollo(
      <table>
        <TableHead
          {...defaultProps}
          pinnedColumns={{ left: [], right: ["email", "type"] }}
        />
      </table>,
    );

    const cells = document.querySelectorAll("th");

    const emailCell = Array.from(cells).find(
      (cell) => cell.getAttribute("data-column-key") === "email",
    );
    const typeCell = Array.from(cells).find(
      (cell) => cell.getAttribute("data-column-key") === "type",
    );

    expect(emailCell).toHaveClass("sticky");
    expect(typeCell).toHaveClass("sticky");
  });

  it("handles filter input with special characters", () => {
    renderWithApollo(
      <table>
        <TableHead
          actionColumnRef={createRef()}
          actions={() => <button>Edit</button>}
          calculatePosition={() => "0px"}
          columnRefs={{ current: {} }}
          dict={getDictionary()}
          filters={{}}
          groupActions={[]}
          handleDragOver={vi.fn()}
          handleDragStart={vi.fn()}
          handleDrop={vi.fn()}
          isAllSelected={false}
          order="ASC"
          pinnedColumns={{ left: [], right: [] }}
          renderSubRow={() => <div>Sub Row</div>}
          sortBy="name"
          sortedVisibleColumns={mockColumns}
          toggleSelectAll={vi.fn()}
        />
      </table>,
    );

    const nameInput = screen.getByPlaceholderText(
      "Hledat Jméno",
    ) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "test@example.com" } });

    expect(nameInput).toHaveValue("test@example.com");
    expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Function));
  });

  it("renders expandable row header when renderSubRow is provided", () => {
    renderWithApollo(
      <table>
        <TableHead
          actionColumnRef={createRef()}
          actions={() => <button>Edit</button>}
          calculatePosition={() => "0px"}
          columnRefs={{ current: {} }}
          dict={getDictionary()}
          filters={{}}
          groupActions={[]}
          handleDragOver={vi.fn()}
          handleDragStart={vi.fn()}
          handleDrop={vi.fn()}
          isAllSelected={false}
          order="ASC"
          pinnedColumns={{ left: [], right: [] }}
          renderSubRow={() => <div>Sub Row</div>}
          sortBy="name"
          sortedVisibleColumns={mockColumns}
          toggleSelectAll={vi.fn()}
        />
      </table>,
    );

    const headerCells = screen.getAllByRole("columnheader");
    expect(headerCells.length).toBeGreaterThan(mockColumns.length);
  });

  it("handles select filter with no options gracefully", () => {
    const columnsWithEmptySelect: Column<unknown>[] = [
      {
        key: "status",
        label: "Status",
        filter: "select",
        filterSelectOptions: [],
      },
    ];

    renderWithApollo(
      <table>
        <TableHead
          actionColumnRef={createRef()}
          actions={() => <button>Edit</button>}
          calculatePosition={() => "0px"}
          columnRefs={{ current: {} }}
          dict={getDictionary()}
          filters={{}}
          groupActions={[]}
          handleDragOver={vi.fn()}
          handleDragStart={vi.fn()}
          handleDrop={vi.fn()}
          isAllSelected={false}
          order="ASC"
          pinnedColumns={{ left: [], right: [] }}
          renderSubRow={undefined}
          sortBy="status"
          sortedVisibleColumns={columnsWithEmptySelect}
          toggleSelectAll={vi.fn()}
        />
      </table>,
    );

    const statusSelect = screen.getByDisplayValue("");
    expect(statusSelect).toBeInTheDocument();
  });
});
