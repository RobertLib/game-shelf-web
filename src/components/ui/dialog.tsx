import { useCallback, useEffect, useRef, useState } from "react";
import { useId } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import cn from "../../utils/cn";
import IconButton from "./icon-button";

type DialogSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface DialogProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  title?: string;
}

export default function Dialog({
  className,
  children,
  size = "sm",
  title,
  "aria-label": ariaLabel,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLElement | null>(null);
  const originalBodyOverflow = useRef<string>("");
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const titleId = useId();

  const navigate = useNavigate();

  const getSizeClasses = (size: DialogSize): string => {
    switch (size) {
      case "sm":
        return "sm:max-w-sm";
      case "md":
        return "sm:max-w-md";
      case "lg":
        return "sm:max-w-lg";
      case "xl":
        return "sm:max-w-xl";
      case "2xl":
        return "sm:max-w-2xl";
      case "full":
        return "sm:max-w-full sm:mx-4";
      default:
        return "sm:max-w-sm";
    }
  };

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (!dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === "Tab") {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);

    closeTimeoutRef.current = setTimeout(() => {
      navigate(-1);
      if (initialFocusRef.current) {
        initialFocusRef.current.focus();
      }
    }, 200);
  }, [navigate]);

  useEffect(() => {
    originalBodyOverflow.current = document.body.style.overflow;

    openTimeoutRef.current = setTimeout(() => setIsOpen(true), 10);

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      } else {
        trapFocus(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalBodyOverflow.current;
    };
  }, [handleClose, trapFocus]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      if (focusableElements.length > 0) {
        initialFocusRef.current = document.activeElement as HTMLElement;
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  const ariaProps = title
    ? { "aria-labelledby": titleId }
    : ariaLabel
      ? { "aria-label": ariaLabel }
      : {};

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={handleClose}
      />

      <div
        {...props}
        {...ariaProps}
        aria-modal="true"
        className={cn(
          "bg-background fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-full max-w-11/12 -translate-x-1/2 -translate-y-1/2 scale-95 transform flex-col overflow-hidden rounded-lg border border-neutral-200 opacity-0 shadow-md transition-all duration-200",
          getSizeClasses(size),
          isOpen && "scale-100 opacity-100",
          className,
        )}
        ref={dialogRef}
        role="dialog"
      >
        {title && (
          <header className="bg-surface sticky top-0 z-1 flex items-center justify-between border-b border-neutral-200 px-6 py-3.25">
            <h2 className="font-semibold" id={titleId}>
              {title}
            </h2>
            <div className="inline-flex">
              <IconButton
                aria-label="Close dialog"
                className="opacity-70 hover:opacity-100"
                onClick={handleClose}
              >
                <X size={18} />
              </IconButton>
            </div>
          </header>
        )}
        {!title && (
          <div className="bg-surface sticky top-0 z-1 flex items-center justify-end border-b border-neutral-200 px-4 py-3.25">
            <IconButton
              aria-label="Close dialog"
              className="opacity-70 hover:opacity-100"
              onClick={handleClose}
            >
              <X size={18} />
            </IconButton>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 pb-17">{children}</div>
      </div>
    </>
  );
}

export function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-surface absolute right-0 bottom-0 left-0 z-10 rounded-b-lg border-t border-neutral-200 px-6 py-3.25",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
