import cn from "../../utils/cn";

type ChipColor =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral";

type ChipProps = React.ComponentProps<"div"> & {
  color?: ChipColor;
};

const colorVariants: Record<ChipColor, string> = {
  primary:
    "border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-700 dark:bg-primary-950 dark:text-primary-200",
  secondary:
    "border-secondary-300 bg-secondary-50 text-secondary-800 dark:border-secondary-700 dark:bg-secondary-950 dark:text-secondary-200",
  success:
    "border-success-300 bg-success-50 text-success-800 dark:border-success-700 dark:bg-success-950 dark:text-success-200",
  danger:
    "border-danger-300 bg-danger-50 text-danger-800 dark:border-danger-700 dark:bg-danger-950 dark:text-danger-200",
  warning:
    "border-warning-300 bg-warning-50 text-warning-800 dark:border-warning-700 dark:bg-warning-950 dark:text-warning-200",
  info: "border-info-300 bg-info-50 text-info-800 dark:border-info-700 dark:bg-info-950 dark:text-info-200",
  neutral:
    "border-neutral-300 bg-neutral-50 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200",
};

export default function Chip({
  className,
  color,
  children,
  ...props
}: ChipProps) {
  return (
    <div
      data-testid="chip"
      {...props}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-sm",
        color ? colorVariants[color] : "border-neutral-300",
        className,
      )}
    >
      {children}
    </div>
  );
}
