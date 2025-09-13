import { Link } from "react-router";
import cn from "../../utils/cn";

interface ButtonProps extends React.ComponentProps<"button"> {
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning";
  link?: string;
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  variant?: "solid" | "outline" | "ghost";
}

export default function Button({
  className,
  color = "primary",
  disabled,
  children,
  link,
  loading = false,
  size = "md",
  type,
  variant = "solid",
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-sm",
    md: "px-3 py-1 text-base",
    lg: "px-4 py-1.5 text-lg",
    icon: "p-2 aspect-square",
  };

  const colorStyles = {
    default: {
      solid:
        "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300/30 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-200 dark:from-gray-800 dark:to-gray-700 dark:text-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600",
      outline:
        "bg-transparent border-[1.5px] border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
      ghost:
        "bg-transparent border-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-800",
    },
    primary: {
      solid:
        "bg-gradient-to-r from-primary-500 to-cyan-500 text-white border-primary-600/30 hover:from-primary-600 hover:to-cyan-600 focus:ring-primary-300",
      outline:
        "bg-transparent border-[1.5px] border-primary-500/30 text-primary-600 hover:bg-gradient-to-r hover:from-primary-500 hover:to-cyan-500 hover:text-white focus:ring-primary-300",
      ghost:
        "bg-transparent border-transparent text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-cyan-50 focus:ring-primary-300",
    },
    secondary: {
      solid:
        "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white border-secondary-600/30 hover:from-secondary-600 hover:to-secondary-700 focus:ring-secondary-300",
      outline:
        "bg-transparent border-[1.5px] border-secondary-500/30 text-secondary-600 hover:bg-gradient-to-r hover:from-secondary-500 hover:to-secondary-600 hover:text-white focus:ring-secondary-300",
      ghost:
        "bg-transparent border-transparent text-secondary-600 hover:bg-gradient-to-r hover:from-secondary-50 hover:to-secondary-50 focus:ring-secondary-300",
    },
    success: {
      solid:
        "bg-gradient-to-r from-success-500 to-success-600 text-white border-success-600/30 hover:from-success-600 hover:to-success-700 focus:ring-success-300",
      outline:
        "bg-transparent border-[1.5px] border-success-500/30 text-success-600 hover:bg-gradient-to-r hover:from-success-500 hover:to-success-600 hover:text-white focus:ring-success-300",
      ghost:
        "bg-transparent border-transparent text-success-600 hover:bg-gradient-to-r hover:from-success-50 hover:to-success-50 focus:ring-success-300",
    },
    danger: {
      solid:
        "bg-gradient-to-r from-danger-500 to-danger-600 text-white border-danger-600/30 hover:from-danger-600 hover:to-danger-700 focus:ring-danger-300",
      outline:
        "bg-transparent border-[1.5px] border-danger-500/30 text-danger-600 hover:bg-gradient-to-r hover:from-danger-500 hover:to-danger-600 hover:text-white focus:ring-danger-300",
      ghost:
        "bg-transparent border-transparent text-danger-600 hover:bg-gradient-to-r hover:from-danger-50 hover:to-danger-50 focus:ring-danger-300",
    },
    warning: {
      solid:
        "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-600/30 hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-300",
      outline:
        "bg-transparent border-[1.5px] border-yellow-500/30 text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500 hover:text-white focus:ring-yellow-300",
      ghost:
        "bg-transparent border-transparent text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 focus:ring-yellow-300",
    },
  };

  const disabledStyles = "opacity-60 cursor-not-allowed";

  const commonClassNames = cn(
    "inline-flex items-center justify-center rounded-md border transition-colors focus:ring-2 focus:outline-none transition-all duration-200",
    variant === "solid" && "shadow-lg hover:shadow-xl",
    sizeStyles[size],
    colorStyles[color][variant],
    (disabled || loading) && disabledStyles,
    className,
  );

  const content = (
    <>
      {loading && (
        <svg
          className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="status"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </>
  );

  if (link) {
    return (
      <Link
        aria-busy={loading}
        aria-disabled={disabled || loading}
        className={commonClassNames}
        to={link}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      {...props}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={commonClassNames}
      disabled={disabled || loading}
      type={type ?? "button"}
    >
      {content}
    </button>
  );
}
