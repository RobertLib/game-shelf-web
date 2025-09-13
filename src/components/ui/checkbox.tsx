import { useCallback, useEffect, useId, useState } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  description?: string;
  error?: string;
  label?: string;
}

export default function Checkbox({
  className,
  defaultChecked,
  description,
  error,
  checked: controlledChecked,
  label,
  name,
  onChange,
  required,
  value,
  ...props
}: CheckboxProps) {
  const [checked, setChecked] = useState(
    controlledChecked ?? defaultChecked ?? false,
  );

  useEffect(() => {
    if (controlledChecked !== undefined) {
      setChecked(controlledChecked);
    }
  }, [controlledChecked]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      setChecked(event.target.checked);
    },
    [onChange],
  );

  const generatedId = useId();
  const checkboxId =
    name && value
      ? `checkbox-${name}-${value}`
      : name
        ? `checkbox-${name}-${generatedId}`
        : `checkbox-${generatedId}`;
  const errorId = error ? `${checkboxId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2">
        <input
          {...props}
          className={cn(
            "accent-primary-500 mt-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "accent-danger-500!",
            className,
          )}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-required={required ? "true" : undefined}
          id={props.id || checkboxId}
          name={name}
          onChange={handleChange}
          required={required}
          type="checkbox"
          checked={checked}
          value={value}
        />

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                className="cursor-pointer text-sm font-medium"
                htmlFor={checkboxId}
              >
                {label}
                {required && <span className="text-danger-500 ml-1">*</span>}
              </label>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  );
}
