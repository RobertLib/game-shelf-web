import { Link, useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";
import cn from "../../utils/cn";
import Skeleton from "./skeleton";

interface Item {
  href: string;
  label: string;
}

interface TabsProps extends React.ComponentProps<"ul"> {
  includeQueryParams?: boolean;
  items: Item[];
  loading?: boolean;
  loadingTabsCount?: number;
  size?: "sm" | "md" | "lg";
}

export default function Tabs({
  className,
  includeQueryParams = false,
  items,
  loading = false,
  loadingTabsCount = 3,
  size = "md",
  ...props
}: TabsProps) {
  const { pathname, search } = useLocation();

  const isActiveTab = (href: string, index: number) => {
    if (includeQueryParams) {
      const currentUrl = pathname + search;

      // Parse both URLs to compare them properly
      const currentUrlObj = new URL(currentUrl, window.location.origin);
      const hrefUrlObj = new URL(href, window.location.origin);

      // Check if pathnames match
      if (currentUrlObj.pathname !== hrefUrlObj.pathname) {
        return false;
      }

      // Get all query parameter keys from href
      const hrefParamKeys = Array.from(hrefUrlObj.searchParams.keys());

      // Check if current URL has any of the query parameters that tabs use
      const hasAnyTabParams = hrefParamKeys.some((key) =>
        currentUrlObj.searchParams.has(key),
      );

      // If no relevant tab parameters in current URL and this is the first tab, consider it active
      if (!hasAnyTabParams && index === 0) {
        return true;
      }

      // Check if all query parameters from href match exactly in current URL
      for (const [key, value] of hrefUrlObj.searchParams.entries()) {
        if (currentUrlObj.searchParams.get(key) !== value) {
          return false;
        }
      }

      return true;
    }
    return pathname.startsWith(href);
  };

  // Predefined widths for skeleton tabs to ensure Tailwind classes exist
  const skeletonWidths = ["w-16", "w-20", "w-24", "w-28", "w-32"];

  // Size variants
  const sizeVariants = {
    sm: {
      container: "p-0.5 space-x-0.5",
      tab: "px-3 py-0.5 text-[13.5px]",
      skeleton: "px-2 py-1",
    },
    md: {
      container: "p-1 space-x-1",
      tab: "px-4 py-0.5 text-sm",
      skeleton: "px-4 py-2",
    },
    lg: {
      container: "p-1.5 space-x-1.5",
      tab: "px-5 py-0.5 text-base",
      skeleton: "px-6 py-3",
    },
  };

  const sizeClasses = sizeVariants[size];

  // Track active tab index and position for animation
  const [activeTabBounds, setActiveTabBounds] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const tabsRef = useRef<HTMLUListElement>(null);
  const activeIndex = items.findIndex((item, index) =>
    isActiveTab(item.href, index),
  );

  useEffect(() => {
    if (!tabsRef.current || loading || activeIndex === -1) return;

    // Skip the first child if it's the animated background indicator
    const children = Array.from(tabsRef.current.children);
    const tabElements = children.filter(
      (child) => child.tagName === "LI",
    ) as HTMLElement[];

    const activeTab = tabElements[activeIndex];
    if (!activeTab) return;

    const containerRect = tabsRef.current.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    setActiveTabBounds({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [activeIndex, loading, items]);

  return (
    <div className="overflow-x-auto">
      <ul
        ref={tabsRef}
        {...props}
        className={cn(
          "bg-background relative inline-flex rounded-md whitespace-nowrap",
          sizeClasses.container,
          className,
        )}
        style={{
          boxShadow: "inset 0 2px 2px 0 rgba(0, 0, 0, 0.02)",
        }}
      >
        {/* Animated background indicator */}
        {!loading && activeTabBounds && (
          <div
            className="bg-surface absolute rounded-md shadow transition-all duration-300 ease-in-out"
            style={{
              left: `${activeTabBounds.left}px`,
              width: `${activeTabBounds.width}px`,
              top: size === "sm" ? "2px" : size === "md" ? "4px" : "6px",
              bottom: size === "sm" ? "2px" : size === "md" ? "4px" : "6px",
            }}
          />
        )}

        {loading
          ? // Loading skeleton tabs
            Array.from({ length: loadingTabsCount }).map((_, index) => (
              <li
                className={cn("rounded-md", sizeClasses.skeleton)}
                key={`skeleton-${index}`}
              >
                <Skeleton
                  height="h-2"
                  width={skeletonWidths[index % skeletonWidths.length]}
                />
              </li>
            ))
          : // Normal tabs
            items.map((item, index) => (
              <li
                className={cn(
                  "relative z-10 rounded-md transition-colors duration-200",
                  isActiveTab(item.href, index)
                    ? ""
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                )}
                key={index}
              >
                <Link
                  className={cn(
                    "flex items-center font-medium",
                    sizeClasses.tab,
                  )}
                  to={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
      </ul>
    </div>
  );
}
