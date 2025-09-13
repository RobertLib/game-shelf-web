import { act, renderHook } from "@testing-library/react";
import { MockInstance } from "vitest";
import useColumnManagement from "../../../../components/ui/data-table/use-column-management";
import useTableState from "../../../../components/ui/data-table/use-table-state";

vi.mock("../../../../components/ui/data-table/use-table-state", () => {
  return {
    default: vi.fn(),
  };
});

describe("useColumnManagement Hook", () => {
  const mockColumns = [
    { key: "name", label: "Jméno" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  const initialState = {
    columnOrder: ["name", "email", "role"],
    columnVisibility: {
      name: true,
      email: true,
      role: true,
    },
    pinnedColumns: { left: [], right: [] },
  };

  const mockUpdateState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useTableState as unknown as MockInstance).mockReturnValue([
      initialState,
      mockUpdateState,
    ]);
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useColumnManagement(mockColumns));

    expect(result.current.columnOrder).toEqual(["name", "email", "role"]);
    expect(result.current.columnVisibility).toEqual({
      name: true,
      email: true,
      role: true,
    });
    expect(result.current.pinnedColumns).toEqual({ left: [], right: [] });
    expect(result.current.visibleColumns).toHaveLength(3);
    expect(result.current.sortedVisibleColumns).toHaveLength(3);
  });

  it("calls useTableState with tableId when provided", () => {
    renderHook(() => useColumnManagement(mockColumns, "users-table"));

    expect(useTableState).toHaveBeenCalledWith(
      "users-table",
      expect.any(Object),
    );
  });

  describe("setColumnOrder", () => {
    it("updates column order with direct value", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.setColumnOrder(["role", "name", "email"]);
      });

      expect(mockUpdateState).toHaveBeenCalledWith({
        columnOrder: ["role", "name", "email"],
      });
    });

    it("updates column order with callback function", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.setColumnOrder((prev) => {
          return [...prev].reverse();
        });
      });

      expect(mockUpdateState).toHaveBeenCalledWith({
        columnOrder: ["role", "email", "name"],
      });
    });
  });

  describe("setColumnVisibility", () => {
    it("updates column visibility with direct value", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.setColumnVisibility({
          name: true,
          email: false,
          role: true,
        });
      });

      expect(mockUpdateState).toHaveBeenCalledWith({
        columnVisibility: {
          name: true,
          email: false,
          role: true,
        },
      });
    });

    it("updates column visibility with callback function", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.setColumnVisibility((prev) => {
          return { ...prev, email: false };
        });
      });

      expect(mockUpdateState).toHaveBeenCalledWith({
        columnVisibility: {
          name: true,
          email: false,
          role: true,
        },
      });
    });
  });

  describe("setPinnedColumns", () => {
    it("updates pinned columns with direct value", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.setPinnedColumns({
          left: ["name"],
          right: ["role"],
        });
      });

      expect(mockUpdateState).toHaveBeenCalledWith({
        pinnedColumns: {
          left: ["name"],
          right: ["role"],
        },
      });
    });

    it("updates pinned columns with callback function", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.setPinnedColumns((prev) => {
          return { ...prev, left: ["name"] };
        });
      });

      expect(mockUpdateState).toHaveBeenCalledWith({
        pinnedColumns: {
          left: ["name"],
          right: [],
        },
      });
    });
  });

  describe("handlePinColumn", () => {
    it("pins a column to the left", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.handlePinColumn("name", "left");
      });

      expect(mockUpdateState).toHaveBeenCalled();

      const updateCall = mockUpdateState.mock.calls[0][0];

      if (typeof updateCall.pinnedColumns === "function") {
        const result = updateCall.pinnedColumns({ left: [], right: [] });
        expect(result).toEqual({
          left: ["name"],
          right: [],
        });
      } else {
        expect(updateCall.pinnedColumns).toEqual({
          left: ["name"],
          right: [],
        });
      }
    });

    it("pins a column to the right", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.handlePinColumn("role", "right");
      });

      const updateCall = mockUpdateState.mock.calls[0][0];

      if (typeof updateCall.pinnedColumns === "function") {
        const result = updateCall.pinnedColumns({ left: [], right: [] });
        expect(result).toEqual({
          left: [],
          right: ["role"],
        });
      } else {
        expect(updateCall.pinnedColumns).toEqual({
          left: [],
          right: ["role"],
        });
      }
    });

    it("unpins a column if already pinned to the same side", () => {
      (useTableState as unknown as MockInstance).mockReturnValue([
        {
          ...initialState,
          pinnedColumns: { left: ["name"], right: [] },
        },
        mockUpdateState,
      ]);

      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.handlePinColumn("name", "left");
      });

      const updateCall = mockUpdateState.mock.calls[0][0];

      if (typeof updateCall.pinnedColumns === "function") {
        const result = updateCall.pinnedColumns({ left: ["name"], right: [] });
        expect(result).toEqual({
          left: [],
          right: [],
        });
      } else {
        expect(updateCall.pinnedColumns).toEqual({
          left: [],
          right: [],
        });
      }
    });

    it("moves a column from one side to another", () => {
      (useTableState as unknown as MockInstance).mockReturnValue([
        {
          ...initialState,
          pinnedColumns: { left: ["name"], right: [] },
        },
        mockUpdateState,
      ]);

      const { result } = renderHook(() => useColumnManagement(mockColumns));

      act(() => {
        result.current.handlePinColumn("name", "right");
      });

      const updateCall = mockUpdateState.mock.calls[0][0];

      if (typeof updateCall.pinnedColumns === "function") {
        const result = updateCall.pinnedColumns({ left: ["name"], right: [] });
        expect(result).toEqual({
          left: [],
          right: ["name"],
        });
      } else {
        expect(updateCall.pinnedColumns).toEqual({
          left: [],
          right: ["name"],
        });
      }
    });
  });

  describe("drag and drop functions", () => {
    it("sets data transfer properties on drag start", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      const mockEvent = {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: "",
        },
      };

      act(() => {
        result.current.handleDragStart(
          mockEvent as unknown as React.DragEvent<HTMLElement>,
          "name",
        );
      });

      expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith(
        "columnKey",
        "name",
      );
      expect(mockEvent.dataTransfer.effectAllowed).toBe("move");
    });

    it("prevents default and sets drop effect on drag over", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          dropEffect: "",
        },
      };

      act(() => {
        result.current.handleDragOver(
          mockEvent as unknown as React.DragEvent<HTMLElement>,
        );
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.dataTransfer.dropEffect).toBe("move");
    });

    it("reorders columns on drop if source and target are different", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue("name"),
        },
      };

      act(() => {
        result.current.handleDrop(
          mockEvent as unknown as React.DragEvent<HTMLElement>,
          "role",
        );
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUpdateState).toHaveBeenCalled();

      const updateCall = mockUpdateState.mock.calls[0][0];

      if (typeof updateCall.columnOrder === "function") {
        const result = updateCall.columnOrder(["name", "email", "role"]);
        expect(result).toEqual(["email", "role", "name"]);
      } else {
        const columns = updateCall.columnOrder;
        const nameIndex = columns.indexOf("name");
        const roleIndex = columns.indexOf("role");

        expect(nameIndex).toBeGreaterThan(roleIndex);
      }
    });

    it("does not reorder columns if source and target are the same", () => {
      const { result } = renderHook(() => useColumnManagement(mockColumns));

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue("name"),
        },
      };

      act(() => {
        result.current.handleDrop(
          mockEvent as unknown as React.DragEvent<HTMLElement>,
          "name",
        );
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockUpdateState).not.toHaveBeenCalled();
    });
  });

  describe("derived values", () => {
    it("filters visible columns correctly", () => {
      (useTableState as unknown as MockInstance).mockReturnValue([
        {
          ...initialState,
          columnVisibility: {
            name: true,
            email: false,
            role: true,
          },
        },
        mockUpdateState,
      ]);

      const { result } = renderHook(() => useColumnManagement(mockColumns));

      expect(result.current.visibleColumns).toHaveLength(2);
      expect(result.current.visibleColumns[0].key).toBe("name");
      expect(result.current.visibleColumns[1].key).toBe("role");
    });

    it("sorts columns based on column order, left and right pinned columns", () => {
      (useTableState as unknown as MockInstance).mockReturnValue([
        {
          ...initialState,
          pinnedColumns: {
            left: ["email"],
            right: ["role"],
          },
        },
        mockUpdateState,
      ]);

      const { result } = renderHook(() => useColumnManagement(mockColumns));

      expect(result.current.sortedVisibleColumns[0].key).toBe("email");
      expect(result.current.sortedVisibleColumns[1].key).toBe("name");
      expect(result.current.sortedVisibleColumns[2].key).toBe("role");
    });

    it("uses column order for non-pinned columns", () => {
      (useTableState as unknown as MockInstance).mockReturnValue([
        {
          ...initialState,
          columnOrder: ["role", "name", "email"],
        },
        mockUpdateState,
      ]);

      const { result } = renderHook(() => useColumnManagement(mockColumns));

      expect(result.current.sortedVisibleColumns[0].key).toBe("role");
      expect(result.current.sortedVisibleColumns[1].key).toBe("name");
      expect(result.current.sortedVisibleColumns[2].key).toBe("email");
    });

    it("sorts columns with complex left and right pinning scenarios", () => {
      (useTableState as unknown as MockInstance).mockReturnValue([
        {
          ...initialState,
          columnOrder: ["name", "email", "role"],
          pinnedColumns: {
            left: ["name"],
            right: ["role"],
          },
        },
        mockUpdateState,
      ]);

      const { result } = renderHook(() => useColumnManagement(mockColumns));

      const sortedKeys = result.current.sortedVisibleColumns.map(
        (col) => col.key,
      );

      expect(sortedKeys).toEqual(["name", "email", "role"]);
    });

    it("sorts columns when both are right pinned", () => {
      const extendedColumns = [
        ...mockColumns,
        { key: "status", label: "Status" },
      ];

      (useTableState as unknown as MockInstance).mockReturnValue([
        {
          columnOrder: ["name", "email", "role", "status"],
          columnVisibility: {
            name: true,
            email: true,
            role: true,
            status: true,
          },
          pinnedColumns: {
            left: [],
            right: ["role", "status"],
          },
        },
        mockUpdateState,
      ]);

      const { result } = renderHook(() => useColumnManagement(extendedColumns));

      const sortedKeys = result.current.sortedVisibleColumns.map(
        (col) => col.key,
      );

      expect(sortedKeys.includes("role")).toBe(true);
      expect(sortedKeys.includes("status")).toBe(true);
      expect(sortedKeys.includes("name")).toBe(true);
      expect(sortedKeys.includes("email")).toBe(true);
      expect(sortedKeys.length).toBe(4);
    });

    it("handles edge case with empty column order", () => {
      (useTableState as unknown as MockInstance).mockReturnValue([
        {
          ...initialState,
          columnOrder: [],
          pinnedColumns: { left: [], right: [] },
        },
        mockUpdateState,
      ]);

      const { result } = renderHook(() => useColumnManagement(mockColumns));

      expect(result.current.sortedVisibleColumns).toHaveLength(3);
    });
  });
});
