import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import cn from "../../utils/cn";

interface PopoverProps extends Omit<React.ComponentProps<"div">, "content"> {
  align?: "left" | "right";
  contentClassName?: string;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  trigger?: React.ReactNode;
  triggerType?: "hover" | "click";
  width?: string;
}

export default function Popover({
  align = "left",
  className,
  contentClassName,
  contentRef,
  children,
  onOpenChange,
  open: controlledOpen,
  position = "right",
  trigger,
  triggerType = "hover",
  width = "200px",
  ...props
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const internalContentRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);

  const popoverId = useId();

  const isControlled = controlledOpen !== undefined;
  const openState = isControlled ? controlledOpen : isOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setIsOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  const updateTriggerRect = useCallback(() => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      setTriggerRect(rect);
    }
  }, []);

  useEffect(() => {
    if (openState) {
      updateTriggerRect();

      const handleResize = () => updateTriggerRect();
      const handleScroll = () => updateTriggerRect();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [openState, updateTriggerRect]);

  useEffect(() => {
    if (triggerType === "click" && openState) {
      const handleClickOutside = (event: MouseEvent) => {
        if (!popoverRef.current?.contains(event.target as Node)) {
          const contentElement =
            contentRef?.current || internalContentRef.current;
          const isClickInsideContent = contentElement?.contains(
            event.target as Node,
          );

          if (!isClickInsideContent) {
            handleOpenChange(false);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [contentRef, handleOpenChange, openState, triggerType]);

  useEffect(() => {
    if (openState) {
      const currentPopoverRef = popoverRef.current;

      const handleFocusOut = (event: FocusEvent) => {
        const relatedTarget = event.relatedTarget as Node;
        const isInPopover = currentPopoverRef?.contains(relatedTarget);
        const contentElement =
          contentRef?.current || internalContentRef.current;
        const isInContent = contentElement?.contains(relatedTarget);

        if (!isInPopover && !isInContent) {
          handleOpenChange(false);
        }
      };

      currentPopoverRef?.addEventListener("focusout", handleFocusOut);

      return () => {
        currentPopoverRef?.removeEventListener("focusout", handleFocusOut);
      };
    }
  }, [contentRef, handleOpenChange, openState]);

  useEffect(() => {
    if (openState) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          handleOpenChange(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [openState, handleOpenChange]);

  const getAbsoluteStyles = useCallback(() => {
    if (!triggerRect) return {};

    const triggerTop = triggerRect.top;
    const triggerLeft = triggerRect.left;
    const triggerWidth = triggerRect.width;
    const triggerHeight = triggerRect.height;

    return {
      content: {
        position: "fixed" as const,
        top: triggerTop,
        left: triggerLeft,
        width: triggerWidth,
        height: triggerHeight,
        zIndex: 9999,
      },
      bridge: {
        position: "fixed" as const,
        top: triggerTop,
        left: triggerLeft,
        width: triggerWidth,
        height: triggerHeight,
        zIndex: 9999,
      },
    };
  }, [triggerRect]);

  const positions = {
    top: {
      bridge: "h-2 bottom-full left-0 w-full",
      popover: {
        left: "bottom-full left-0",
        right: "bottom-full right-0",
      },
    },
    bottom: {
      bridge: "h-2 top-full left-0 w-full",
      popover: {
        left: "top-full left-0",
        right: "top-full right-0",
      },
    },
    left: {
      bridge: "w-2 right-full top-0 h-full",
      popover: "right-full top-0",
    },
    right: {
      bridge: "w-2 left-full top-0 h-full",
      popover: "left-full top-0",
    },
  };

  const handleToggle = () => {
    handleOpenChange(!openState);
  };

  const handleClick =
    triggerType === "click"
      ? {
          "aria-controls": openState ? popoverId : undefined,
          "aria-expanded": openState,
          "aria-haspopup": true,
          onClick: handleToggle,
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleToggle();
            }
          },
          role: "button",
          tabIndex: 0,
        }
      : {};

  const handleMouseEvents =
    triggerType === "hover"
      ? {
          onMouseEnter: () => handleOpenChange(true),
          onMouseLeave: () => {
            setTimeout(() => {
              const bridgeElement = bridgeRef.current;
              const contentElement =
                contentRef?.current || internalContentRef.current;

              const isHoveringBridge =
                bridgeElement && bridgeElement.matches(":hover");
              const isHoveringContent =
                contentElement && contentElement.matches(":hover");

              if (!isHoveringBridge && !isHoveringContent) {
                handleOpenChange(false);
              }
            }, 50);
          },
        }
      : {};

  const handleContentClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      {...handleClick}
      {...handleMouseEvents}
      {...props}
      className={cn(
        "popover relative",
        triggerType === "click" &&
          "focus-visible:ring-primary-300 cursor-pointer rounded-md focus:outline-none focus-visible:ring-2",
        className,
      )}
      ref={popoverRef}
    >
      {trigger || <div className="absolute inset-0" />}

      {openState &&
        triggerRect &&
        createPortal(
          <div
            className="relative inline-flex"
            style={getAbsoluteStyles().content}
          >
            <div
              className={cn(
                "popover-bridge absolute z-10",
                positions[position].bridge,
              )}
              onMouseEnter={() => {
                if (triggerType === "hover") handleOpenChange(true);
              }}
              ref={bridgeRef}
            />

            <div
              aria-modal={triggerType === "click" ? "true" : undefined}
              className={cn(
                "animate-fade-in bg-surface absolute z-10 max-h-60 overflow-y-auto rounded-md border border-neutral-100 shadow-md",
                position === "top" || position === "bottom"
                  ? positions[position].popover[align]
                  : positions[position].popover,
                position === "top" && "mb-2",
                position === "bottom" && "mt-2",
                position === "left" && "mr-2",
                position === "right" && "ml-2",
                contentClassName,
              )}
              id={popoverId}
              onClick={handleContentClick}
              onMouseEnter={() => {
                if (triggerType === "hover") handleOpenChange(true);
              }}
              onMouseLeave={() => {
                if (triggerType === "hover") handleOpenChange(false);
              }}
              ref={contentRef || internalContentRef}
              role="dialog"
              style={{ minWidth: width }}
            >
              {children}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
