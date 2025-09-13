import { useEffect, useRef, useState } from "react";
import { useId } from "react";
import { X } from "lucide-react";
import cn from "../../utils/cn";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface ToastProps extends React.ComponentProps<"div"> {
  duration?: number;
  message: string;
  onClose?: () => void;
  variant?: ToastVariant;
}

export default function Toast({
  className,
  duration = 3000,
  message,
  onClose,
  variant = "default",
  ...props
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastId = useId();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!visible && onClose) {
      const timer = setTimeout(onClose, 200);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  useEffect(() => {
    const currentToastRef = toastRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    currentToastRef?.addEventListener("keydown", handleKeyDown);

    return () => {
      currentToastRef?.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const variantStyles = {
    default:
      "border-secondary-200 text-secondary-800 bg-surface dark:text-secondary-200",
    success:
      "border-success-200 bg-success-50 text-success-800 dark:bg-success-900 dark:text-success-200 dark:border-success-800",
    error:
      "border-danger-200 bg-danger-50 text-danger-800 dark:bg-danger-900 dark:text-danger-200 dark:border-danger-800",
    warning:
      "border-warning-200 bg-warning-50 text-warning-800 dark:bg-warning-900 dark:text-warning-200 dark:border-warning-800",
    info: "border-info-200 bg-info-50 text-info-800 dark:bg-info-900 dark:text-info-200 dark:border-info-800",
  };

  return (
    <div
      {...props}
      aria-atomic="true"
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        visible ? "animate-slide-down" : "animate-slide-up",
        "rounded-md border p-4 shadow-md focus:outline-none focus-visible:ring-2",
        variantStyles[variant],
        className,
      )}
      id={toastId}
      ref={toastRef}
      role="status"
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <button
            aria-label="Close notification"
            className="ml-3 text-gray-500 hover:text-gray-700"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
