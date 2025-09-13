import { useFormControl } from "./form/use-form-control";
import { useId } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface DateTimePickerProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  dim?: "sm" | "md" | "lg";
  error?: string;
  label?: string;
  type?: "date" | "time" | "datetime-local" | "month" | "week";
}

export default function DateTimePicker({
  className,
  defaultValue,
  dim = "md",
  error,
  label,
  name,
  required,
  type = "date",
  ...props
}: DateTimePickerProps) {
  const { value, handleChange } = useFormControl({ ...props, defaultValue });

  const dimStyles = {
    sm: "px-1 py-0 text-sm",
    md: "px-2 py-1 text-base",
    lg: "px-3 py-2 text-lg",
  };

  const generatedId = useId();
  const inputId = name
    ? `datetime-input-${name}`
    : `datetime-input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;

  // Placeholder based on input type
  const getPlaceholder = () => {
    if (props.placeholder) return props.placeholder;

    switch (type) {
      case "time":
        return "HH:MM";
      case "datetime-local":
        return "DD.MM.YYYY HH:MM";
      case "date":
      default:
        return "DD.MM.YYYY";
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="block truncate text-sm font-medium" htmlFor={inputId}>
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <input
        {...props}
        className={cn(
          "form-control",
          dimStyles[dim],
          error && "border-danger-500! focus:ring-danger-300!",
          className,
        )}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
        aria-required={required ? "true" : undefined}
        id={props.id || inputId}
        name={name}
        onChange={handleChange}
        placeholder={getPlaceholder()}
        required={required}
        type={type}
        value={value}
      />

      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  );
}
