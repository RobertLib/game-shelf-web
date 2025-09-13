import { act, renderHook } from "@testing-library/react";
import useRowSelection from "../../../../components/ui/data-table/use-row-selection";

describe("useRowSelection Hook", () => {
  const mockData = [
    { id: "1", name: "John Doe", email: "john@example.com" },
    { id: "2", name: "Jane Smith", email: "jane@example.com" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com" },
  ];

  it("initializes with empty selected rows", () => {
    const { result } = renderHook(() => useRowSelection(mockData));

    expect(result.current.selectedRows).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
  });

  it("toggles row selection to add a row", () => {
    const { result } = renderHook(() => useRowSelection(mockData));

    act(() => {
      result.current.toggleRowSelection(mockData[0]);
    });

    expect(result.current.selectedRows).toEqual([mockData[0]]);
    expect(result.current.isAllSelected).toBe(false);
  });

  it("toggles row selection to remove a row", () => {
    const { result } = renderHook(() => useRowSelection(mockData));

    act(() => {
      result.current.toggleRowSelection(mockData[0]);
    });

    expect(result.current.selectedRows).toEqual([mockData[0]]);

    act(() => {
      result.current.toggleRowSelection(mockData[0]);
    });

    expect(result.current.selectedRows).toEqual([]);
  });

  it("adds multiple rows when toggling different rows", () => {
    const { result } = renderHook(() => useRowSelection(mockData));

    act(() => {
      result.current.toggleRowSelection(mockData[0]);
      result.current.toggleRowSelection(mockData[2]);
    });

    expect(result.current.selectedRows).toHaveLength(2);
    expect(result.current.selectedRows).toContainEqual(mockData[0]);
    expect(result.current.selectedRows).toContainEqual(mockData[2]);
    expect(result.current.selectedRows).not.toContainEqual(mockData[1]);
  });

  it("selects all rows with toggleSelectAll when none are selected", () => {
    const { result } = renderHook(() => useRowSelection(mockData));

    act(() => {
      result.current.toggleSelectAll();
    });

    expect(result.current.selectedRows).toEqual(mockData);
    expect(result.current.isAllSelected).toBe(true);
  });

  it("deselects all rows with toggleSelectAll when all are selected", () => {
    const { result } = renderHook(() => useRowSelection(mockData));

    act(() => {
      result.current.toggleSelectAll();
    });

    expect(result.current.selectedRows).toEqual(mockData);

    act(() => {
      result.current.toggleSelectAll();
    });

    expect(result.current.selectedRows).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
  });

  it("sets isAllSelected to true only when all rows are selected", () => {
    const { result } = renderHook(() => useRowSelection(mockData));

    act(() => {
      result.current.toggleRowSelection(mockData[0]);
      result.current.toggleRowSelection(mockData[1]);
    });

    expect(result.current.selectedRows).toHaveLength(2);
    expect(result.current.isAllSelected).toBe(false);

    act(() => {
      result.current.toggleRowSelection(mockData[2]);
    });

    expect(result.current.selectedRows).toHaveLength(3);
    expect(result.current.isAllSelected).toBe(true);
  });

  it("updates isAllSelected when data changes", () => {
    const { result, rerender } = renderHook((data) => useRowSelection(data), {
      initialProps: mockData,
    });

    act(() => {
      result.current.toggleSelectAll();
    });

    expect(result.current.isAllSelected).toBe(true);

    const extendedData = [
      ...mockData,
      { id: "4", name: "Alice Green", email: "alice@example.com" },
    ];

    rerender(extendedData);

    expect(result.current.isAllSelected).toBe(false);
  });

  it("allows direct setting of selected rows", () => {
    const { result } = renderHook(() => useRowSelection(mockData));

    act(() => {
      result.current.setSelectedRows([mockData[1], mockData[2]]);
    });

    expect(result.current.selectedRows).toHaveLength(2);
    expect(result.current.selectedRows).toContainEqual(mockData[1]);
    expect(result.current.selectedRows).toContainEqual(mockData[2]);
    expect(result.current.selectedRows).not.toContainEqual(mockData[0]);
  });

  it("handles empty data arrays correctly", () => {
    const { result } = renderHook(() => useRowSelection<{ id: string }>([]));

    expect(result.current.isAllSelected).toBe(false);

    act(() => {
      result.current.toggleSelectAll();
    });

    expect(result.current.selectedRows).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
  });
});
