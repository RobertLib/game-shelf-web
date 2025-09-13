import { type Column } from ".";
import { useCallback, useMemo } from "react";
import useTableState, { type TableState } from "./use-table-state";

export default function useColumnManagement<T>(
  columns: Column<T>[],
  tableId?: string,
) {
  const defaultState: TableState = {
    columnOrder: columns.map((col) => col.key),
    columnVisibility: columns.reduce(
      (acc, column) => {
        acc[column.key] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
    pinnedColumns: { left: [], right: [] },
  };

  const [state, updateState] = useTableState(tableId, defaultState);

  const { columnOrder, columnVisibility, pinnedColumns } = state;

  const setColumnOrder = useCallback(
    (newOrder: string[] | ((prev: string[]) => string[])) => {
      if (typeof newOrder === "function") {
        updateState({
          columnOrder: newOrder(columnOrder),
        });
      } else {
        updateState({ columnOrder: newOrder });
      }
    },
    [columnOrder, updateState],
  );

  const setColumnVisibility = useCallback(
    (
      newVisibility:
        | Record<string, boolean>
        | ((prev: Record<string, boolean>) => Record<string, boolean>),
    ) => {
      if (typeof newVisibility === "function") {
        updateState({
          columnVisibility: newVisibility(columnVisibility),
        });
      } else {
        updateState({ columnVisibility: newVisibility });
      }
    },
    [columnVisibility, updateState],
  );

  const setPinnedColumns = useCallback(
    (
      newPinnedColumns:
        | { left: string[]; right: string[] }
        | ((prev: { left: string[]; right: string[] }) => {
            left: string[];
            right: string[];
          }),
    ) => {
      if (typeof newPinnedColumns === "function") {
        updateState({
          pinnedColumns: newPinnedColumns(pinnedColumns),
        });
      } else {
        updateState({ pinnedColumns: newPinnedColumns });
      }
    },
    [pinnedColumns, updateState],
  );

  const handlePinColumn = useCallback(
    (columnKey: string, position: "left" | "right") => {
      setPinnedColumns((prev) => {
        const oppositePosition = position === "left" ? "right" : "left";

        const oppositeFiltered = prev[oppositePosition].filter(
          (key) => key !== columnKey,
        );

        const isCurrentlyPinned = prev[position].includes(columnKey);

        if (isCurrentlyPinned) {
          return {
            ...prev,
            [oppositePosition]: oppositeFiltered,
            [position]: prev[position].filter((key) => key !== columnKey),
          };
        }

        return {
          ...prev,
          [oppositePosition]: oppositeFiltered,
          [position]: [...prev[position], columnKey],
        };
      });
    },
    [setPinnedColumns],
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>, columnKey: string) => {
      event.dataTransfer.setData("columnKey", columnKey);
      event.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>, targetColumnKey: string) => {
      event.preventDefault();

      const draggedColumnKey = event.dataTransfer.getData("columnKey");

      if (draggedColumnKey !== targetColumnKey) {
        setColumnOrder((prevOrder) => {
          const newOrder = [...prevOrder];
          const draggedIdx = newOrder.indexOf(draggedColumnKey);
          const targetIdx = newOrder.indexOf(targetColumnKey);

          newOrder.splice(draggedIdx, 1);
          newOrder.splice(targetIdx, 0, draggedColumnKey);

          return newOrder;
        });
      }
    },
    [setColumnOrder],
  );

  const visibleColumns = useMemo(() => {
    return columns.filter((column) => columnVisibility[column.key]);
  }, [columns, columnVisibility]);

  const sortedVisibleColumns = useMemo(() => {
    return [...visibleColumns].sort((a, b) => {
      if (
        pinnedColumns.left.includes(a.key) &&
        !pinnedColumns.left.includes(b.key)
      ) {
        return -1;
      }
      if (
        !pinnedColumns.left.includes(a.key) &&
        pinnedColumns.left.includes(b.key)
      ) {
        return 1;
      }
      if (
        pinnedColumns.right.includes(a.key) &&
        !pinnedColumns.right.includes(b.key)
      ) {
        return 1;
      }
      if (
        !pinnedColumns.right.includes(a.key) &&
        pinnedColumns.right.includes(b.key)
      ) {
        return -1;
      }

      return columnOrder.indexOf(a.key) - columnOrder.indexOf(b.key);
    });
  }, [columnOrder, pinnedColumns.left, pinnedColumns.right, visibleColumns]);

  return {
    columnOrder,
    columnVisibility,
    handleDragOver,
    handleDragStart,
    handleDrop,
    handlePinColumn,
    pinnedColumns,
    setColumnOrder,
    setColumnVisibility,
    setPinnedColumns,
    sortedVisibleColumns,
    visibleColumns,
  };
}
