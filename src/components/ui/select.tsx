import { useFormControl } from "./form/use-form-control";
import { useEffect, useRef } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface Option<T = string | number> {
  label: string;
  value: T;
}

interface SelectProps extends React.ComponentProps<"select"> {
  dim?: "xs" | "sm" | "md" | "lg";
  error?: string;
  hasEmpty?: boolean;
  label?: string;
  options: Option[];
}

export default function Select({
  className,
  defaultValue,
  dim = "md",
  disabled,
  error,
  hasEmpty,
  label,
  name,
  options,
  required,
  ...props
}: SelectProps) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const { value, handleChange } = useFormControl({ ...props, defaultValue });

  useEffect(() => {
    if (value && selectRef.current) {
      selectRef.current.value = value as string;
    }
  }, [value]);

  const dimStyles = {
    xs: "px-1 py-0.5 text-sm",
    sm: "px-1 py-1 text-sm",
    md: "px-1.5 py-1.5 text-base",
    lg: "px-3 py-3 text-lg",
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="block truncate text-sm font-medium" htmlFor={name}>
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <select
        {...props}
        className={cn(
          "form-control",
          dimStyles[dim],
          disabled && "cursor-not-allowed opacity-50",
          error && "border-danger-500! focus:ring-danger-300!",
          className,
        )}
        disabled={disabled}
        id={props.id || name}
        name={name}
        onChange={handleChange}
        ref={selectRef}
        required={required}
        value={value}
      >
        {hasEmpty && <option value="" />}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <FormError>{error}</FormError>
    </div>
  );
}
