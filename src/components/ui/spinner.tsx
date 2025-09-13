import cn from "../../utils/cn";

type SpinnerSize = "sm" | "md" | "lg" | "xl";

type SpinnerProps = React.ComponentProps<"div"> & {
  size?: SpinnerSize;
};

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export default function Spinner({
  className,
  size = "md",
  ...props
}: SpinnerProps) {
  return (
    <div
      data-testid="spinner"
      {...props}
      className={cn("flex items-center justify-center", className)}
    >
      <svg
        className={`${sizeClasses[size]} animate-spin`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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
    </div>
  );
}
