import { getDictionary } from "../../../dictionaries";
import { getTableParams } from "./table-params";
import { TableBody } from "./table-body";
import { TableFooter } from "./table-footer";
import { TableHead } from "./table-head";
import { TableHeader } from "./table-header";
import { type PageInfo } from "../../../__generated__/graphql";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import Button from "../button";
import cn from "../../../utils/cn";
import useColumnManagement from "./use-column-management";
import useRowSelection from "./use-row-selection";

export interface Column<T> {
  customFilter?: (
    handleFilterChange: (key: string, value: string) => void,
    filterValue: string,
  ) => React.ReactNode;
  filter?: "input" | "select" | "date" | "time" | "datetime" | "custom";
  filterSelectOptions?: { label: string; value: string | number }[];
  key: string;
  label: string;
  maxWidth?: number;
  minWidth?: number;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface GroupAction<T> {
  label: string;
  onClick: (selectedRows: (T & { id: string })[]) => void;
}

interface DataTableProps<T> extends React.ComponentProps<"div"> {
  actions?: (row: T) => React.ReactNode;
  columns: Column<T>[];
  data: (T & { id: string })[];
  enableGlobalSearch?: boolean;
  expandedByDefault?: boolean;
  getRowBackgroundColor?: (row: T & { id: string }) => string | undefined;
  groupActions?: GroupAction<T>[];
  loading?: boolean;
  pageInfo?: PageInfo;
  renderSubRow?: (row: T & { id: string }) => React.ReactNode;
  tableId?: string;
  toolbar?: React.ReactNode;
  total?: number;
}

export default function DataTable<T extends { id: string }>({
  actions,
  className,
  columns,
  data,
  enableGlobalSearch = false,
  expandedByDefault = false,
  getRowBackgroundColor,
  groupActions,
  loading,
  pageInfo,
  renderSubRow,
  tableId,
  toolbar,
  total,
  ...props
}: DataTableProps<T>) {
  const [searchParams] = useSearchParams();

  const dict = getDictionary();

  const { first, last, page, sortBy, order, filters } =
    getTableParams(searchParams);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set(expandedByDefault ? data.map((row) => row.id) : []),
  );

  const toggleRowExpansion = useCallback((rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }

      return newSet;
    });
  }, []);

  const actionColumnRef = useRef<HTMLTableCellElement>(null);
  const columnRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const tableRef = useRef<HTMLTableElement>(null);

  const {
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
  } = useColumnManagement(columns, tableId);

  const { isAllSelected, selectedRows, toggleRowSelection, toggleSelectAll } =
    useRowSelection(data);

  useEffect(() => {
    if (!data.length) return;

    const observer = new ResizeObserver((entries) => {
      const newWidths: Record<string, number> = {};

      entries.forEach((entry) => {
        const columnKey = entry.target.getAttribute("data-column-key");

        if (columnKey) {
          newWidths[columnKey] = entry.target.getBoundingClientRect().width;
        }
      });

      if (Object.keys(newWidths).length > 0) {
        setColumnWidths((prev) => ({
          ...prev,
          ...newWidths,
        }));
      }
    });

    if (actions && actionColumnRef.current) {
      observer.observe(actionColumnRef.current);
    }

    Object.entries(columnRefs.current).forEach(([, ref]) => {
      if (ref) observer.observe(ref);
    });

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [actions, data.length]);

  const handleResetSettings = useCallback(() => {
    setColumnOrder(columns.map((column) => column.key));
    setColumnVisibility(
      Object.fromEntries(columns.map((column) => [column.key, true])),
    );
    setPinnedColumns({
      left: [],
      right: [],
    });
  }, [columns, setColumnOrder, setColumnVisibility, setPinnedColumns]);

  const calculatePosition = useCallback(
    (columnKey: string, position: "left" | "right"): string => {
      if (position === "left") {
        const columnIndex = pinnedColumns.left.indexOf(columnKey);

        if (columnIndex === -1) return "auto";

        let leftPosition = 0;

        if (actions) {
          leftPosition += columnWidths["actions"] || 0;
        }

        if (groupActions && groupActions.length > 0) {
          leftPosition += columnWidths["selection"] || 30;
        }

        for (let i = 0; i < columnIndex; i++) {
          const prevColumnKey = pinnedColumns.left[i];
          leftPosition += columnWidths[prevColumnKey] || 0;
        }

        return `${leftPosition}px`;
      } else {
        const columnIndex = pinnedColumns.right.indexOf(columnKey);

        if (columnIndex === -1) return "auto";

        let rightPosition = 0;

        for (let i = columnIndex + 1; i < pinnedColumns.right.length; i++) {
          const nextColumnKey = pinnedColumns.right[i];
          rightPosition += columnWidths[nextColumnKey] || 0;
        }

        return `${rightPosition}px`;
      }
    },
    [
      actions,
      columnWidths,
      groupActions,
      pinnedColumns.left,
      pinnedColumns.right,
    ],
  );

  return (
    <div
      {...props}
      aria-label="Data table"
      className={cn(
        isFullScreen ? "bg-surface fixed inset-0 z-50" : "relative",
        className,
      )}
      role="region"
    >
      {groupActions && groupActions.length > 0 && (
        <div className="mb-2 flex items-center gap-3.5">
          <div className="flex gap-2">
            {groupActions.map((action) => (
              <Button
                disabled={selectedRows.length === 0}
                key={action.label}
                onClick={() => action.onClick(selectedRows)}
                size="sm"
                variant="outline"
              >
                {action.label}
              </Button>
            ))}
          </div>
          {selectedRows.length > 0 && (
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {selectedRows.length === 1
                ? dict.dataTable.selectedItemsSingular
                : selectedRows.length >= 2 && selectedRows.length <= 4
                  ? dict.dataTable.selectedItemsPlural.replace(
                      "{0}",
                      selectedRows.length.toString(),
                    )
                  : dict.dataTable.selectedItemsGenitive.replace(
                      "{0}",
                      selectedRows.length.toString(),
                    )}
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          "overflow-x-auto rounded-t-lg border border-neutral-100 shadow-lg",
          isFullScreen
            ? "max-h-[calc(100vh-50px)]"
            : "max-h-[calc(100vh-200px)]",
        )}
      >
        <TableHeader
          columnOrder={columnOrder}
          columns={columns}
          columnVisibility={columnVisibility}
          enableGlobalSearch={enableGlobalSearch}
          handleDragOver={handleDragOver}
          handleDragStart={handleDragStart}
          handleDrop={handleDrop}
          handlePinColumn={handlePinColumn}
          isFullScreen={isFullScreen}
          onResetSettings={handleResetSettings}
          pinnedColumns={pinnedColumns}
          setColumnVisibility={setColumnVisibility}
          setIsFullScreen={setIsFullScreen}
          toolbar={toolbar}
        />

        <table
          aria-busy={loading}
          aria-colcount={sortedVisibleColumns.length}
          aria-rowcount={data.length}
          className="bg-surface w-full"
          ref={tableRef}
          role="grid"
        >
          <TableHead
            actionColumnRef={actionColumnRef}
            actions={actions}
            calculatePosition={calculatePosition}
            columnRefs={columnRefs}
            dict={dict}
            filters={filters}
            groupActions={groupActions}
            handleDragOver={handleDragOver}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
            isAllSelected={isAllSelected}
            order={order}
            pinnedColumns={pinnedColumns}
            renderSubRow={renderSubRow}
            sortBy={sortBy}
            sortedVisibleColumns={sortedVisibleColumns}
            toggleSelectAll={toggleSelectAll}
          />

          <TableBody
            actions={actions}
            calculatePosition={calculatePosition}
            data={data}
            dict={dict}
            expandedRows={expandedRows}
            filters={filters}
            getRowBackgroundColor={getRowBackgroundColor}
            groupActions={groupActions}
            loading={loading}
            pinnedColumns={pinnedColumns}
            renderSubRow={renderSubRow}
            selectedRows={selectedRows}
            sortedVisibleColumns={sortedVisibleColumns}
            toggleRowExpansion={toggleRowExpansion}
            toggleRowSelection={toggleRowSelection}
          />
        </table>
      </div>

      <TableFooter
        currentPage={page}
        first={first}
        last={last}
        pageInfo={pageInfo}
        total={total}
      />
    </div>
  );
}
