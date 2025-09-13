import "./drawer.css";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router";
import { use, useRef, useState } from "react";
import cn from "../../utils/cn";
import DrawerContext from "../../contexts/drawer-context";
import Overlay from "./overlay";
import Popover from "./popover";
import useIsMobile from "../../hooks/use-is-mobile";
import useIsMounted from "../../hooks/use-is-mounted";

interface Item {
  href?: string;
  children?: Item[];
  icon?: React.ReactNode;
  label: string;
}

interface DrawerProps extends React.ComponentProps<"aside"> {
  isLoading?: boolean;
  items: Item[];
}

export default function Drawer({
  className,
  isLoading,
  items,
  ...props
}: DrawerProps) {
  const { isCollapsed, isOpen, toggleOpen } = use(DrawerContext);

  const isMobile = useIsMobile();
  const isMounted = useIsMounted();

  return (
    <>
      {isOpen && isMobile && isMounted && (
        <Overlay
          onClick={toggleOpen}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              toggleOpen();
            }
          }}
          role="button"
          tabIndex={0}
        />
      )}
      <aside
        {...props}
        aria-hidden={!isOpen}
        aria-label="Main navigation"
        className={cn(
          "drawer bg-surface fixed inset-y-0 left-0 z-40 flex flex-col border-r border-neutral-100 shadow-lg transition-all duration-300",
          isCollapsed ? "drawer-collapsed" : "",
          isOpen
            ? "drawer-open translate-x-0"
            : "drawer-closed -translate-x-full",
          className,
        )}
      >
        {!isCollapsed && (
          <div className="flex-shrink-0 p-4 pb-1">
            <Link to="/">
              <img alt="Logo" className="mb-5 h-10" src="/logo.webp" />
            </Link>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {isLoading ? (
              <DrawerSkeleton isCollapsed={isCollapsed} />
            ) : (
              items
                .filter((item) => !item.children || item.children.length > 0)
                .map((item, index) => (
                  <DrawerItem
                    item={item}
                    key={index}
                    isCollapsed={isCollapsed}
                  />
                ))
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}

interface DrawerItemProps {
  isCollapsed?: boolean;
  item: Item;
  level?: number;
}

function DrawerItem({ isCollapsed, item, level = 0 }: DrawerItemProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const { toggleOpen } = use(DrawerContext);

  const itemRef = useRef<HTMLLIElement>(null);

  const hasChildren = item.children && item.children.length > 0;

  // Check if any child is active
  const hasActiveChild = () => {
    if (!hasChildren) return false;
    return (
      item.children?.some((child) => {
        if (child.href && location.pathname.startsWith(child.href)) {
          return true;
        }
        // Recursively check nested children
        if (child.children) {
          return checkActiveInChildren(child.children);
        }
        return false;
      }) || false
    );
  };

  const checkActiveInChildren = (children: Item[]): boolean => {
    return children.some((child) => {
      if (child.href && location.pathname.startsWith(child.href)) {
        return true;
      }
      if (child.children) {
        return checkActiveInChildren(child.children);
      }
      return false;
    });
  };

  const [isExpanded, setIsExpanded] = useState(hasActiveChild());
  const [showPopover, setShowPopover] = useState(false);

  const isActive = () => {
    if (!item.href) return false;
    return location.pathname.startsWith(item.href);
  };

  const handleToggle = () => {
    if (hasChildren && !isCollapsed) {
      setIsExpanded((prev) => !prev);
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      toggleOpen();
    }
  };

  return (
    <li
      className="relative"
      onMouseOver={() => isCollapsed && setShowPopover(true)}
      onMouseOut={() => isCollapsed && setShowPopover(false)}
      ref={itemRef}
    >
      {item.href && !hasChildren ? (
        <Link
          aria-current={isActive() ? "page" : undefined}
          className={cn(
            "focus:ring-primary-300 flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100 focus:ring-2 focus:outline-none dark:hover:bg-gray-800",
            isActive() &&
              "text-primary-600 dark:text-primary-400 bg-gray-100 font-medium dark:bg-zinc-800",
            level > 0 && "pl-7",
            isCollapsed && level === 0 && "justify-center",
          )}
          onClick={handleLinkClick}
          to={item.href}
        >
          {item.icon && (
            <span
              aria-hidden="true"
              className={cn(!(isCollapsed && level === 0) && "mr-3")}
            >
              {item.icon}
            </span>
          )}
          {(!isCollapsed || level > 0) && item.label}
        </Link>
      ) : (
        <button
          aria-controls={
            hasChildren
              ? `submenu-${item.label?.toLowerCase().replace(/\s/g, "-")}`
              : undefined
          }
          aria-expanded={isExpanded}
          aria-haspopup="true"
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
            isActive() &&
              "text-primary-600 dark:text-primary-400 bg-gray-100 font-medium dark:bg-zinc-800",
            level > 0 && "pl-7",
            isCollapsed && level === 0 && "justify-center",
          )}
          onClick={handleToggle}
          type="button"
        >
          <span className="flex items-center">
            {item.icon && (
              <span className={cn(!(isCollapsed && level === 0) && "mr-3")}>
                {item.icon}
              </span>
            )}
            {(!isCollapsed || level > 0) && item.label}
          </span>
          {hasChildren && !isCollapsed && (
            <span className="ml-auto">
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-90",
                )}
              />
            </span>
          )}
        </button>
      )}

      {hasChildren && isExpanded && !isCollapsed && (
        <ul
          className="animate-slide-down mt-1 space-y-1"
          id={`submenu-${item.label?.toLowerCase().replace(/\s/g, "-")}`}
          role="menu"
        >
          {item.children
            ?.filter((child) => !child.children || child.children.length > 0)
            .map((child, index) => (
              <DrawerItem
                isCollapsed={isCollapsed}
                item={child}
                key={index}
                level={level + 1}
              />
            ))}
        </ul>
      )}

      {isCollapsed && hasChildren && level === 0 && showPopover && (
        <Popover
          contentClassName="p-2"
          onOpenChange={setShowPopover}
          open={showPopover}
          position="bottom"
        >
          <div className="px-3 py-1 font-medium">{item.label}</div>
          <ul className="mt-1 space-y-1">
            {item.children
              ?.filter((child) => !child.children || child.children.length > 0)
              .map((child, index) => (
                <DrawerItem isCollapsed={false} item={child} key={index} />
              ))}
          </ul>
        </Popover>
      )}
    </li>
  );
}

interface DrawerSkeletonProps {
  isCollapsed?: boolean;
}

function DrawerSkeleton({ isCollapsed }: DrawerSkeletonProps) {
  const skeletonItems = Array.from({ length: 5 }, (_, index) => index);

  return (
    <>
      {skeletonItems.map((index) => (
        <li key={index} className="animate-pulse">
          <div
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2",
              isCollapsed ? "justify-center" : "justify-start",
            )}
          >
            {/* Icon skeleton */}
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            {/* Label skeleton */}
            {!isCollapsed && (
              <div className="ml-3 h-4 max-w-24 flex-1 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
        </li>
      ))}
    </>
  );
}
