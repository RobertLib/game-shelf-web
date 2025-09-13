import cn from "../../../utils/cn";

interface FormErrorProps extends React.ComponentProps<"div"> {
  children?: React.ReactNode;
}

export default function FormError({
  className,
  children,
  ...props
}: FormErrorProps) {
  if (!children) return null;

  return (
    <div
      data-testid="form-error"
      {...props}
      className={cn(
        "text-danger-600 dark:text-danger-400 animate-fade-in text-sm",
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
