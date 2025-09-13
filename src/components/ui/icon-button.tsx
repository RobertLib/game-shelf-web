import cn from "../../utils/cn";

interface IconButtonProps extends React.ComponentProps<"button"> {
  loading?: boolean;
  variant?: "default" | "primary" | "secondary" | "danger";
}

export default function IconButton({
  className,
  disabled,
  children,
  loading = false,
  type,
  variant = "default",
  ...props
}: IconButtonProps) {
  const variantStyles = {
    default: "",
    primary: "text-primary-500",
    secondary: "text-secondary-500",
    danger: "text-danger-500",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      {...props}
      aria-busy={loading}
      aria-disabled={disabled}
      className={cn(
        "focus-visible:ring-primary-300 -m-1 cursor-pointer rounded-md p-1 leading-[1] transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 dark:hover:bg-gray-800",
        variantStyles[variant],
        (disabled || loading) && disabledStyles,
        className,
      )}
      disabled={disabled || loading}
      type={type ?? "button"}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin text-current"
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
      ) : (
        children
      )}
    </button>
  );
}
