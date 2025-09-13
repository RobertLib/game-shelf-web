import { cn } from "../../utils/cn";

interface ProgressProps {
  className?: string;
  description?: string;
  label?: string;
  max?: number;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  value: number;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
}

export default function Progress({
  className,
  description,
  label,
  max = 100,
  showPercentage = false,
  size = "md",
  value,
  variant = "primary",
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    primary: "bg-primary-600",
    secondary: "bg-secondary-600",
    success: "bg-success-600",
    warning: "bg-warning-600",
    danger: "bg-danger-600",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || description || showPercentage) && (
        <div className="mb-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {label && <span>{label}</span>}
            {description && (
              <span className={label ? "ml-2" : ""}>{description}</span>
            )}
          </div>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={value}
        className={cn(
          "w-full rounded-full bg-gray-200 dark:bg-gray-700",
          sizeClasses[size],
        )}
        role="progressbar"
      >
        <div
          className={cn(
            "rounded-full transition-all duration-300",
            sizeClasses[size],
            variantClasses[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
