import { Link, useLocation } from "react-router";
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
}

export default function Tabs({
  className,
  includeQueryParams = false,
  items,
  loading = false,
  loadingTabsCount = 3,
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

  return (
    <div className="overflow-x-auto">
      <ul
        {...props}
        className={cn(
          "inline-flex space-x-1 rounded-md bg-gray-100 p-1 whitespace-nowrap dark:bg-gray-800",
          className,
        )}
      >
        {loading
          ? // Loading skeleton tabs
            Array.from({ length: loadingTabsCount }).map((_, index) => (
              <li key={`skeleton-${index}`} className="rounded-md px-4 py-2">
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
                  "rounded-md",
                  isActiveTab(item.href, index)
                    ? "bg-surface shadow"
                    : "text-gray-500",
                )}
                key={index}
              >
                <Link className="px-4 text-sm font-medium" to={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
      </ul>
    </div>
  );
}
