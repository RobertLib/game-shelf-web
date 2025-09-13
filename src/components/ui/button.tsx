import cn from "../../utils/cn";

interface ButtonProps extends React.ComponentProps<"button"> {
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "danger"
    | "outline"
    | "ghost";
}

export default function Button({
  className,
  disabled,
  children,
  loading = false,
  size = "md",
  type,
  variant = "primary",
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-sm",
    md: "px-3 py-1 text-base",
    lg: "px-4 py-1.5 text-lg",
    icon: "p-2 aspect-square",
  };

  const variantStyles = {
    default:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300/30 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 dark:from-gray-800 dark:to-gray-700 dark:text-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600",
    primary:
      "bg-gradient-to-r from-primary-500 to-cyan-500 text-white border-primary-600/30 hover:from-primary-600 hover:to-cyan-600 focus:ring-primary-300 shadow-lg hover:shadow-xl transition-all duration-200",
    secondary:
      "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white border-secondary-600/30 hover:from-secondary-600 hover:to-secondary-700 focus:ring-secondary-300 shadow-lg hover:shadow-xl transition-all duration-200",
    danger:
      "bg-gradient-to-r from-danger-500 to-danger-600 text-white border-danger-600/30 hover:from-danger-600 hover:to-danger-700 focus:ring-danger-300 shadow-lg hover:shadow-xl transition-all duration-200",
    outline:
      "bg-transparent border-[1.5px] border-primary-500/30 text-primary-600 hover:bg-gradient-to-r hover:from-primary-500 hover:to-cyan-500 hover:text-white focus:ring-primary-300 transition-all duration-200",
    ghost:
      "bg-transparent border-transparent text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-cyan-50 focus:ring-primary-300 transition-all duration-200",
  };

  const disabledStyles = "opacity-60 cursor-not-allowed";

  return (
    <button
      {...props}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-md border transition-colors focus:ring-2 focus:outline-none",
        sizeStyles[size],
        variantStyles[variant],
        (disabled || loading) && disabledStyles,
        className,
      )}
      disabled={disabled || loading}
      type={type ?? "button"}
    >
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
    </button>
  );
}
