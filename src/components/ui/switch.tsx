import { useId } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface SwitchProps extends React.ComponentProps<"input"> {
  error?: string;
  label?: string;
}

export default function Switch({
  className,
  error,
  label,
  name,
  required,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const inputId = name ? `switch-${name}` : `switch-${generatedId}`;
  const labelId = `${inputId}-label`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5 backdrop-blur-sm">
      <label
        className={cn("inline-flex cursor-pointer items-center", className)}
      >
        <input
          {...props}
          aria-describedby={error ? errorId : undefined}
          aria-checked={props.checked ?? false}
          aria-invalid={error ? "true" : undefined}
          aria-labelledby={labelId}
          className="peer sr-only"
          id={props.id || inputId}
          name={name}
          required={required}
          role="switch"
          type="checkbox"
        />
        <div
          aria-hidden="true"
          className={cn(
            "peer peer-checked:bg-primary-600 peer-focus:ring-primary-300 dark:peer-checked:bg-primary-600 dark:peer-focus:ring-primary-800 relative h-5 w-9 rounded-full border-neutral-600 bg-gray-200 peer-focus:ring-2 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:bg-gray-700",
            error &&
              "border-danger-500 peer-focus:ring-danger-300 dark:peer-focus:ring-danger-800",
          )}
        />
        {label && (
          <span
            className={cn(
              "ms-3 text-sm font-medium text-gray-900 dark:text-gray-300",
              error && "text-danger-500",
            )}
            id={labelId}
          >
            {label} {required && <span className="text-danger-500">*</span>}
          </span>
        )}
      </label>

      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  );
}
