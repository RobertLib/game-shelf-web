import { isValidElement, useId, useState } from "react";
import { Link } from "react-router";
import cn from "../../utils/cn";
import Popover from "./popover";

interface Item {
  href?: string;
  label: string;
  onClick?: () => void;
}

interface DropdownProps extends React.ComponentProps<"div"> {
  items: (Item | React.ReactNode)[];
  trigger: React.ReactNode;
}

export default function Dropdown({ items, trigger, ...props }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const itemStyles =
    "block w-full text-sm text-left px-4 py-1.25 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors";

  const id = useId();
  const menuId = `dropdown-menu-${id}}`;

  const validItems = items.filter((item) => item !== null);

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
          prev < validItems.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        if (activeIndex >= 0) {
          event.preventDefault();
          const selectedItem = validItems[activeIndex];

          if (
            !isValidElement(selectedItem) &&
            typeof selectedItem === "object" &&
            "label" in selectedItem
          ) {
            if (selectedItem.onClick) {
              selectedItem.onClick();
            }
            setOpen(false);
          }
        }
        break;
      default:
        break;
    }
  };

  const dropdownMenu = (
    <ul
      aria-orientation="vertical"
      className="min-w-48"
      id={menuId}
      role="menu"
      tabIndex={-1}
    >
      {validItems.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <li
            aria-selected={isActive}
            className="m-1"
            key={index}
            onMouseEnter={() => setActiveIndex(index)}
            role="menuitem"
          >
            {isValidElement(item) ? (
              item
            ) : typeof item === "object" && "label" in item ? (
              item.href ? (
                <Link
                  className={cn(
                    itemStyles,
                    isActive && "bg-gray-100 dark:bg-gray-800",
                  )}
                  to={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  className={cn(
                    itemStyles,
                    isActive && "bg-gray-100 dark:bg-gray-800",
                  )}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  type="button"
                >
                  {item.label}
                </button>
              )
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <Popover
      align="right"
      contentClassName="mt-2.5"
      onKeyDown={handleKeyDown}
      onOpenChange={setOpen}
      open={open}
      position="bottom"
      trigger={
        <div className="rounded-md p-1 leading-[1] transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
          {trigger}
        </div>
      }
      triggerType="click"
      width="auto"
      {...props}
    >
      {dropdownMenu}
    </Popover>
  );
}
