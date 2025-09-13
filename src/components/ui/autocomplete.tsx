import { getDictionary } from "../../dictionaries";
import {
  gql,
  type DocumentNode,
  type OperationVariables,
} from "@apollo/client";
import { ChevronDown, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLazyQuery } from "@apollo/client/react";
import cn from "../../utils/cn";
import debounce from "../../utils/debounce";
import FormError from "./form/form-error";
import Chip from "./chip";
import Popover from "./popover";
import Spinner from "./spinner";

const EMPTY_QUERY = gql`
  query EmptyQuery {
    __typename
  }
`;

const PAGE_SIZE = 100;

interface Option<T = string | number> {
  label: string;
  value: T;
  data?: unknown;
}

interface GraphQLDataItem {
  id?: string | number;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface BaseAutocompleteProps<TItem extends GraphQLDataItem = GraphQLDataItem>
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  asSelect?: boolean;
  error?: string;
  getOptionLabel?: (item: TItem) => string;
  getOptionValue?: (item: TItem) => string;
  hasEmpty?: boolean;
  label?: string;
  loadMore?: () => Promise<void>;
  maxSelections?: number;
  multiple?: boolean;
  name?: string;
  onChange?: (
    value: Option["value"][] | Option["value"] | null,
    data?: TItem[] | TItem | null,
  ) => void;
  placeholder?: string;
  required?: boolean;
  syncWithDefaultValue?: boolean;
  value?: Option["value"][] | Option["value"] | null;
}

interface GraphQLAutocompleteProps<
  TItem extends GraphQLDataItem = GraphQLDataItem,
  TVariables extends OperationVariables = OperationVariables,
> extends BaseAutocompleteProps<TItem> {
  dataPath: string;
  options?: never;
  query: DocumentNode;
  variables: (search: string) => Omit<TVariables, "first" | "after">;
}

interface StaticAutocompleteProps<
  TItem extends GraphQLDataItem = GraphQLDataItem,
> extends BaseAutocompleteProps<TItem> {
  dataPath?: never;
  options: Option[];
  query?: never;
  variables?: never;
}

type AutocompleteProps<
  TItem extends GraphQLDataItem = GraphQLDataItem,
  TVariables extends OperationVariables = OperationVariables,
> =
  | GraphQLAutocompleteProps<TItem, TVariables>
  | StaticAutocompleteProps<TItem>;

export default function Autocomplete<
  TItem extends GraphQLDataItem = GraphQLDataItem,
  TVariables extends OperationVariables = OperationVariables,
>({
  asSelect = false,
  className,
  dataPath,
  defaultValue,
  error,
  getOptionLabel,
  getOptionValue,
  hasEmpty = false,
  label,
  loadMore,
  maxSelections,
  multiple = false,
  name,
  onChange,
  options,
  placeholder,
  query,
  required,
  syncWithDefaultValue = false,
  value,
  variables,
  ...props
}: AutocompleteProps<TItem, TVariables>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [graphqlOptions, setGraphqlOptions] = useState<Option[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const dropdownRef = useRef<HTMLUListElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const hasUserInteracted = useRef(false);

  const generatedId = useId();
  const inputId = name ? `input-${name}` : `input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const listboxId = useId();

  const dict = getDictionary();

  const [fetchData, { data, loading: graphqlLoading }] = useLazyQuery(
    query || EMPTY_QUERY,
    { fetchPolicy: "cache-and-network" },
  );

  const [fetchPreloadData, { data: preloadData, loading: preloadLoading }] =
    useLazyQuery(query || EMPTY_QUERY, { fetchPolicy: "cache-and-network" });

  const currentOptions = useMemo(
    () => (query ? graphqlOptions : options || []),
    [graphqlOptions, options, query],
  );

  const filteredOptions = asSelect
    ? currentOptions
    : currentOptions.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
      );

  const isLoading = query ? graphqlLoading : loading;

  const displayedOptions =
    asSelect && hasEmpty
      ? [{ label: " ", value: "" }, ...filteredOptions]
      : filteredOptions;

  const isPreloadingDefaultValue = Boolean(
    preloadLoading && query && defaultValue,
  );

  const hasDefaultValueBeenSet = useRef(false);
  const previousDefaultValue = useRef(defaultValue);

  // Effect to preload default values for GraphQL mode
  useEffect(() => {
    if (
      !query ||
      !variables ||
      !defaultValue ||
      hasDefaultValueBeenSet.current
    ) {
      return;
    }

    const ids = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    const validIds = ids.filter(
      (id) => id !== null && id !== undefined && id !== "",
    );

    if (validIds.length === 0) return;

    const idFilter =
      validIds.length === 1 ? { eq: validIds[0] } : { in: validIds };
    const baseVariables = variables("");
    const filter = baseVariables.filter
      ? { ...baseVariables.filter, id: idFilter }
      : { id: idFilter };

    fetchPreloadData({
      variables: { ...baseVariables, filter },
    });
  }, [defaultValue, fetchPreloadData, query, variables]);

  // Effect to process preload data
  useEffect(() => {
    if (!preloadData || !dataPath) return;

    // Don't reset selectedOptions if user has already interacted with the component
    if (hasUserInteracted.current) return;

    const result = dataPath
      .split(".")
      .reduce(
        (acc: Record<string, unknown> | undefined, path: string) =>
          acc?.[path] as Record<string, unknown> | undefined,
        preloadData as Record<string, unknown>,
      ) as { nodes?: TItem[] };

    if (result?.nodes) {
      const options = result.nodes.map((node: TItem) => ({
        label: getOptionLabel
          ? getOptionLabel(node)
          : node.name || node.email || "",
        value: getOptionValue ? getOptionValue(node) : node.id || "",
        data: node,
      }));

      setSelectedOptions(options);

      if (options.length === 1 && !multiple) {
        setSearch(options[0].label);
      }

      hasDefaultValueBeenSet.current = true;
    }
  }, [dataPath, getOptionLabel, getOptionValue, multiple, preloadData]);

  // Effect to handle value and defaultValue changes
  useEffect(() => {
    // Watch for the first setting of defaultValue (from undefined to value) or subsequent changes when syncWithDefaultValue is true
    const isFirstDefaultValueSet =
      !hasDefaultValueBeenSet.current && defaultValue !== undefined;
    const hasDefaultValueChanged =
      previousDefaultValue.current !== defaultValue;
    const shouldRun =
      isFirstDefaultValueSet ||
      (syncWithDefaultValue && hasDefaultValueChanged);

    // Don't reset if user has interacted and we don't explicitly want to sync
    if (hasUserInteracted.current && !syncWithDefaultValue) return;

    // Use value if defined, otherwise defaultValue
    const valueToUse =
      value !== undefined ? value : shouldRun ? defaultValue : undefined;

    if (valueToUse !== undefined && currentOptions.length > 0) {
      if (valueToUse === null || valueToUse === "") {
        setSelectedOptions([]);
        setSearch("");
        if (isFirstDefaultValueSet) hasDefaultValueBeenSet.current = true;
        return;
      }

      const selectedValues = Array.isArray(valueToUse)
        ? valueToUse
        : [valueToUse];

      const uniqueSelectedValues = [...new Set(selectedValues)];

      const selected = currentOptions.filter((option) =>
        uniqueSelectedValues.includes(option.value),
      );

      setSelectedOptions(selected);

      if (selected.length === 1 && !multiple) {
        setSearch(selected[0].label);
      }

      if (isFirstDefaultValueSet) hasDefaultValueBeenSet.current = true;
    } else if (
      shouldRun &&
      syncWithDefaultValue &&
      hasDefaultValueChanged &&
      (valueToUse === undefined || valueToUse === null || valueToUse === "")
    ) {
      // Handle reset when syncWithDefaultValue is true and defaultValue has actually changed
      setSelectedOptions([]);
      setSearch("");
    }

    // Update the previous defaultValue reference
    if (hasDefaultValueChanged) {
      previousDefaultValue.current = defaultValue;
    }
  }, [currentOptions, defaultValue, multiple, syncWithDefaultValue, value]);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        if (query && variables && fetchData) {
          setGraphqlOptions([]);
          setCursor(null);
          setIsSearching(false);
          fetchData({
            variables: { ...variables(searchTerm), first: PAGE_SIZE },
          });
        }
      }, 300),
    [fetchData, query, variables],
  );

  useEffect(() => {
    if (query && !asSelect && open) {
      if (search) {
        setIsSearching(true);
        debouncedSearch(search);
      } else {
        setIsSearching(false);
      }
    }
    setActiveIndex(-1);
  }, [asSelect, debouncedSearch, open, query, search]);

  useEffect(() => {
    if (!data || !dataPath || !query) return;

    const result = dataPath
      .split(".")
      .reduce(
        (acc: Record<string, unknown> | undefined, path: string) =>
          acc?.[path] as Record<string, unknown> | undefined,
        data as Record<string, unknown>,
      ) as {
      nodes?: TItem[];
      pageInfo?: {
        endCursor?: string;
        hasNextPage?: boolean;
      };
    };

    if (result?.nodes) {
      const newOptions = result.nodes.map((node: TItem) => ({
        label: getOptionLabel
          ? getOptionLabel(node)
          : node.name || node.email || "",
        value: getOptionValue ? getOptionValue(node) : node.id || "",
        data: node,
      }));

      setGraphqlOptions((prev) => {
        if (cursor) {
          const existingValues = new Set(prev.map((option) => option.value));
          const uniqueNewOptions = newOptions.filter(
            (option) => !existingValues.has(option.value),
          );
          return [...prev, ...uniqueNewOptions];
        } else {
          return newOptions;
        }
      });
      setCursor(result.pageInfo?.endCursor || null);
      setHasMore(result.pageInfo?.hasNextPage || false);
    }
  }, [cursor, data, dataPath, getOptionLabel, getOptionValue, query]);

  const handleScroll = useCallback(async () => {
    const popoverContent = popoverContentRef.current;

    if (!popoverContent) return;

    const { clientHeight, scrollHeight, scrollTop } = popoverContent;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (loading) return;

      try {
        setLoading(true);

        if (query && variables && cursor && hasMore) {
          await fetchData({
            variables: {
              ...variables(search),
              after: cursor,
              first: PAGE_SIZE,
            },
          });
        } else if (loadMore) {
          await loadMore();
        }
      } finally {
        setLoading(false);
      }
    }
  }, [cursor, fetchData, hasMore, loading, loadMore, query, search, variables]);

  useEffect(() => {
    if (open && query && variables) {
      // In asSelect mode, always load data when opening
      // In regular mode, load if we have no options (regardless of search)
      const shouldLoad = asSelect || graphqlOptions.length === 0;

      if (shouldLoad) {
        fetchData({
          variables: { ...variables(""), first: PAGE_SIZE },
        });
      }
    }
  }, [asSelect, fetchData, graphqlOptions.length, open, query, variables]);

  useEffect(() => {
    if (!open) return;

    let currentPopoverContent: HTMLDivElement | null = null;

    const timeoutId = setTimeout(() => {
      currentPopoverContent = popoverContentRef.current;

      if (!currentPopoverContent) return;

      currentPopoverContent.addEventListener("scroll", handleScroll);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (currentPopoverContent) {
        currentPopoverContent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll, open]);

  const handleSelect = (option: Option) => {
    hasUserInteracted.current = true;

    if (option.value === "" && hasEmpty) {
      setSelectedOptions([]);
      setSearch("");
      setOpen(false);
      onChange?.(null, null);
      return;
    }

    if (multiple) {
      const existingOption = selectedOptions.find(
        (o) => o.value === option.value,
      );
      if (existingOption) {
        // Toggle off - remove the option
        const newSelection = selectedOptions.filter(
          (o) => o.value !== option.value,
        );
        setSelectedOptions(newSelection);
        onChange?.(
          newSelection.map((o) => o.value),
          newSelection.map((o) => o.data as TItem).filter(Boolean),
        );
      } else {
        // Toggle on - add the option (check limit)
        if (maxSelections && selectedOptions.length >= maxSelections) return;
        const newSelection = [...selectedOptions, option];
        setSelectedOptions(newSelection);
        onChange?.(
          newSelection.map((o) => o.value),
          newSelection.map((o) => o.data as TItem).filter(Boolean),
        );
      }
    } else {
      setSelectedOptions([option]);
      setSearch(option.label);
      setOpen(false);
      onChange?.(option.value, (option.data as TItem) || null);
    }
  };

  const handleRemove = (option: Option) => {
    hasUserInteracted.current = true;

    const newSelection = selectedOptions.filter(
      (o) => o.value !== option.value,
    );
    setSelectedOptions(newSelection);

    if (multiple) {
      onChange?.(
        newSelection.map((o) => o.value),
        newSelection.map((o) => o.data as TItem).filter(Boolean),
      );
    } else {
      onChange?.(null, null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setOpen(true);
        return;
      }
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < displayedOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Home":
        if (open && displayedOptions.length > 0) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open && displayedOptions.length > 0) {
          event.preventDefault();
          setActiveIndex(displayedOptions.length - 1);
        }
        break;
      case "Enter":
        if (activeIndex >= 0 && displayedOptions[activeIndex]) {
          event.preventDefault();
          handleSelect(displayedOptions[activeIndex]);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div {...props} className={cn("relative", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium" htmlFor={inputId}>
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      {name &&
        (multiple
          ? [
              ...selectedOptions.map((option) => (
                <input
                  key={option.value}
                  name={name}
                  readOnly
                  type="hidden"
                  value={option.value}
                />
              )),
              // Hidden input for required validation in multiple mode
              required && (
                <input
                  key="validation"
                  name={`${name}_validation`}
                  readOnly
                  required={selectedOptions.length === 0}
                  style={{ position: "absolute", opacity: 0 }}
                  tabIndex={-1}
                  type="text"
                  value={selectedOptions.length > 0 ? "valid" : ""}
                />
              ),
            ]
          : selectedOptions[0] && (
              <input
                name={name}
                readOnly
                type="hidden"
                value={selectedOptions[0].value}
              />
            ))}

      <Popover
        className="w-full"
        contentRef={popoverContentRef}
        onFocus={() => !asSelect && setOpen(true)}
        onKeyDown={handleKeyDown}
        onOpenChange={setOpen}
        open={open}
        position="bottom"
        trigger={
          multiple ? (
            <div
              className={cn(
                "bg-surface flex max-h-40 w-full flex-wrap items-center gap-1 overflow-y-auto rounded-md border border-neutral-300 px-2 py-1",
                error && "border-danger-500! focus:ring-danger-300!",
              )}
            >
              {preloadLoading &&
              query &&
              !!defaultValue &&
              selectedOptions.length === 0 ? (
                <Chip className="opacity-50">
                  {dict.autocomplete.loadingDefaultValues}
                </Chip>
              ) : (
                selectedOptions.map((option) => (
                  <Chip
                    className="cursor-pointer"
                    key={option.value}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleRemove(option);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.stopPropagation();
                        handleRemove(option);
                      }
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {option.label}&nbsp;×
                  </Chip>
                ))
              )}
              <input
                aria-activedescendant={
                  activeIndex >= 0
                    ? `option-${displayedOptions[activeIndex]?.value}`
                    : undefined
                }
                aria-autocomplete="list"
                aria-controls={open ? listboxId : undefined}
                aria-describedby={error ? errorId : undefined}
                aria-expanded={open}
                aria-invalid={error ? "true" : undefined}
                aria-required={required ? "true" : undefined}
                autoComplete="off"
                className="flex-grow focus:outline-none"
                id={props.id || inputId}
                onClick={(event) => {
                  if (!asSelect) event.stopPropagation();
                }}
                onChange={({ target }) => {
                  setSearch(target.value);
                  setOpen(true);
                }}
                placeholder={placeholder}
                readOnly={asSelect || isPreloadingDefaultValue}
                tabIndex={asSelect ? -1 : 0}
                type="text"
                value={search}
              />
              {isPreloadingDefaultValue ? (
                <Spinner size="sm" />
              ) : (
                <ChevronDown
                  className={cn(
                    "transition-transform duration-200",
                    open && "rotate-180 transform",
                  )}
                  size={16}
                />
              )}
            </div>
          ) : (
            <div
              className={cn(
                "bg-surface relative flex w-full items-center rounded-md border border-neutral-300 px-2 py-1",
                error && "border-danger-500! focus:ring-danger-300!",
                asSelect && "cursor-pointer",
              )}
            >
              <input
                aria-activedescendant={
                  activeIndex >= 0
                    ? `option-${displayedOptions[activeIndex]?.value}`
                    : undefined
                }
                aria-autocomplete="list"
                aria-controls={open ? listboxId : undefined}
                aria-describedby={error ? errorId : undefined}
                aria-expanded={open}
                aria-invalid={error ? "true" : undefined}
                aria-required={required ? "true" : undefined}
                autoComplete="off"
                className={cn(
                  "flex-grow focus:outline-none",
                  asSelect && "cursor-pointer",
                )}
                id={props.id || inputId}
                onClick={(event) => {
                  if (!asSelect) event.stopPropagation();
                }}
                onChange={({ target }) => {
                  if (!asSelect) {
                    if (
                      selectedOptions[0] &&
                      target.value !== selectedOptions[0].label
                    ) {
                      hasUserInteracted.current = true;
                      setSelectedOptions([]);
                    }
                    setSearch(target.value);
                    setOpen(true);
                  }
                }}
                placeholder={
                  isPreloadingDefaultValue
                    ? dict.autocomplete.loadingDefaultValues
                    : placeholder
                }
                readOnly={asSelect || isPreloadingDefaultValue}
                required={required}
                role="combobox"
                tabIndex={asSelect ? -1 : 0}
                type="text"
                value={selectedOptions[0] ? selectedOptions[0].label : search}
              />
              {selectedOptions[0] && !asSelect && (
                <button
                  aria-label="Clear"
                  className="ml-2 cursor-pointer p-1 focus:outline-none"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    hasUserInteracted.current = true;
                    setSelectedOptions([]);
                    setSearch("");
                    onChange?.(null, null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.stopPropagation();
                      hasUserInteracted.current = true;
                      setSelectedOptions([]);
                      setSearch("");
                      onChange?.(null, null);
                    }
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  type="button"
                >
                  <X className="mr-0.5" size={16} />
                </button>
              )}
              {isPreloadingDefaultValue ? (
                <Spinner size="sm" />
              ) : (
                <ChevronDown
                  className={cn(
                    "transition-transform duration-200",
                    open && "rotate-180 transform",
                  )}
                  size={16}
                />
              )}
            </div>
          )
        }
        triggerType="click"
        width="100%"
      >
        <ul
          aria-label={`Options for ${label || "selection"}`}
          aria-multiselectable={multiple}
          id={listboxId}
          ref={dropdownRef}
          role="listbox"
        >
          {displayedOptions.length === 0 && !isLoading && !isSearching && (
            <li className="px-2 py-1 text-sm text-gray-500" role="status">
              {dict.autocomplete.noResults}
            </li>
          )}
          {isSearching
            ? null
            : displayedOptions.map((option, index) => {
                const isSelected = !!selectedOptions.find(
                  (o) => o.value === option.value,
                );
                const isActive = index === activeIndex;

                return (
                  <li
                    aria-selected={isSelected}
                    className={cn(
                      "cursor-pointer px-2 py-1 focus:outline-none",
                      !isSelected &&
                        "hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800",
                      isSelected &&
                        "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
                      isSelected &&
                        "hover:bg-gray-300 focus-visible:bg-gray-300 dark:hover:bg-gray-600 dark:focus-visible:bg-gray-600",
                      !isSelected && isActive && "bg-gray-100 dark:bg-gray-800",
                    )}
                    id={`option-${option.value}`}
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleSelect(option);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    role="option"
                    tabIndex={-1}
                  >
                    {option.label}
                  </li>
                );
              })}
          {/* Show loading only when we have no data OR when paginating */}
          {((isLoading || isSearching) && displayedOptions.length === 0) ||
          (loading && displayedOptions.length > 0) ? (
            <li className="flex items-center gap-2 p-2" role="status">
              {dict.autocomplete.loading} <Spinner size="sm" />
            </li>
          ) : null}
        </ul>
      </Popover>

      {error && (
        <FormError className="mt-1.5" id={errorId}>
          {error}
        </FormError>
      )}
    </div>
  );
}
