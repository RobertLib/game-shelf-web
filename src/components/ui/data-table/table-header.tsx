import {
  Columns3,
  GripVertical,
  Maximize,
  Minimize,
  PanelLeft,
  PanelRight,
  Search,
} from "lucide-react";
import { type Column } from ".";
import { getDictionary } from "../../../dictionaries";
import { resetTableParams } from "./table-params";
import { useSearchParams } from "react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import cn from "../../../utils/cn";
import debounce from "../../../utils/debounce";
import Dropdown from "../dropdown";
import IconButton from "../icon-button";
import Switch from "../switch";

interface TableHeaderProps<T> {
  columnOrder: string[];
  columns: Column<T>[];
  columnVisibility: Record<string, boolean>;
  enableGlobalSearch?: boolean;
  handleDragOver: (event: React.DragEvent<HTMLElement>) => void;
  handleDragStart: (
    event: React.DragEvent<HTMLElement>,
    columnKey: string,
  ) => void;
  handleDrop: (event: React.DragEvent<HTMLElement>, columnKey: string) => void;
  handlePinColumn: (columnKey: string, position: "left" | "right") => void;
  isFullScreen: boolean;
  onResetSettings: () => void;
  pinnedColumns: { left: string[]; right: string[] };
  setColumnVisibility: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  toolbar: React.ReactNode;
}

export function TableHeader<T>({
  columnOrder,
  columns,
  columnVisibility,
  enableGlobalSearch = false,
  handleDragOver,
  handleDragStart,
  handleDrop,
  handlePinColumn,
  isFullScreen,
  onResetSettings,
  pinnedColumns,
  setColumnVisibility,
  setIsFullScreen,
  toolbar,
}: TableHeaderProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isSearchOpen, setIsSearchOpen] = useState(
    Boolean(searchParams.get("search")),
  );
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? "",
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  const dict = getDictionary();

  const updateSearch = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value.trim()) {
        newParams.set("search", value.trim());
        resetTableParams(newParams);
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  const debouncedUpdateSearchRef = useRef(debounce(updateSearch, 300));

  useEffect(() => {
    debouncedUpdateSearchRef.current = debounce(updateSearch, 300);
  }, [updateSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedUpdateSearchRef.current(value);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen && searchValue) {
      setSearchValue("");
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      setSearchParams(newParams);
    }
  };

  // Focus search input when it opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      // Small delay to ensure the input is visible after animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  const hasCustomSettings = () => {
    const defaultColumnOrder = columns.map((col) => col.key);
    const isColumnOrderChanged =
      columnOrder.length !== defaultColumnOrder.length ||
      !columnOrder.every((col, index) => col === defaultColumnOrder[index]);

    const isColumnVisibilityChanged = Object.values(columnVisibility).some(
      (visible) => !visible,
    );

    const isPinnedColumnsChanged =
      pinnedColumns.left.length > 0 || pinnedColumns.right.length > 0;

    return (
      isColumnOrderChanged ||
      isColumnVisibilityChanged ||
      isPinnedColumnsChanged
    );
  };

  return (
    <header className="bg-surface sticky top-0 left-0 z-3 flex h-10 items-start justify-between p-2 pb-0">
      <div>{toolbar}</div>
      <div className="flex items-center gap-2">
        {enableGlobalSearch && (
          <div className="flex items-center">
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isSearchOpen ? "mr-2 w-64 opacity-100" : "w-0 opacity-0",
              )}
            >
              <input
                className="focus:border-primary-500 h-[26px] w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    toggleSearch();
                  }
                }}
                placeholder={dict.dataTable.search}
                ref={searchInputRef}
                type="text"
                value={searchValue}
              />
            </div>

            <IconButton
              aria-label={isSearchOpen ? "Close search" : "Open search"}
              className={cn(
                "transition-colors duration-200",
                isSearchOpen && "text-primary-600 dark:text-primary-400",
              )}
              onClick={toggleSearch}
            >
              <Search size={18} />
            </IconButton>
          </div>
        )}

        <Dropdown
          items={[
            <div className="mb-1 border-b border-neutral-200 pb-1" key="reset">
              <button
                className="w-full cursor-pointer rounded p-1.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
                disabled={!hasCustomSettings()}
                onClick={onResetSettings}
                type="button"
              >
                Reset
              </button>
            </div>,
            ...[...columns]
              .sort(
                (a, b) =>
                  columnOrder.indexOf(a.key) - columnOrder.indexOf(b.key),
              )
              .map((column) => (
                <div
                  className="flex items-center p-1"
                  key={column.key}
                  onDragOver={handleDragOver}
                  onDrop={(event) => handleDrop(event, column.key)}
                >
                  <button
                    aria-label="Drag column"
                    className="mr-2 cursor-grab opacity-50 hover:opacity-100"
                    data-testid={`drag-handle-${column.key}`}
                    draggable
                    onDragStart={(event) => {
                      handleDragStart(event, column.key);
                      event.dataTransfer.setDragImage(
                        event.currentTarget.closest("div") as Element,
                        0,
                        0,
                      );
                    }}
                    type="button"
                  >
                    <GripVertical size={16} />
                  </button>
                  <button
                    aria-label={`Pin column ${column.label} to left`}
                    aria-pressed={pinnedColumns.left.includes(column.key)}
                    className={cn(
                      "mr-2 cursor-pointer opacity-50 hover:opacity-100",
                      pinnedColumns.left.includes(column.key) &&
                        "text-primary-500 opacity-100",
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePinColumn(column.key, "left");
                    }}
                    type="button"
                  >
                    <PanelLeft aria-hidden="true" size={16} />
                  </button>
                  <button
                    aria-label={`Pin column ${column.label} to right`}
                    className={cn(
                      "mr-2 cursor-pointer opacity-50 hover:opacity-100",
                      pinnedColumns.right.includes(column.key) &&
                        "text-primary-500 opacity-100",
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePinColumn(column.key, "right");
                    }}
                    type="button"
                  >
                    <PanelRight aria-hidden="true" size={16} />
                  </button>
                  <Switch
                    className="ml-1"
                    checked={columnVisibility[column.key]}
                    onChange={({ target }) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [column.key]: target.checked,
                      }))
                    }
                  />
                  <span className="ml-3 text-sm font-medium whitespace-nowrap">
                    {column.label}
                  </span>
                </div>
              )),
          ]}
          trigger={<Columns3 aria-label="Toggle column visibility" size={18} />}
        />

        <IconButton
          aria-label="Toggle full screen"
          aria-pressed={isFullScreen}
          onClick={() => setIsFullScreen((prev) => !prev)}
        >
          {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </IconButton>
      </div>
    </header>
  );
}
