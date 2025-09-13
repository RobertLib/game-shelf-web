import { useFormControl } from "./form/use-form-control";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface Option<T = string | number> {
  label: string;
  value: T;
}

interface RadioGroupProps {
  className?: string;
  defaultValue?: string | number;
  dim?: "xs" | "sm" | "md" | "lg";
  error?: string;
  label?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  options: Option[];
  required?: boolean;
  value?: string | number;
}

export default function RadioGroup({
  className,
  defaultValue,
  dim = "md",
  error,
  label,
  name,
  options,
  required,
  ...props
}: RadioGroupProps) {
  const { value, handleChange } = useFormControl({ ...props, defaultValue });

  const dimStyles = {
    xs: "text-sm",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const radioSizeStyles = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <fieldset>
          <legend className="block text-sm font-medium">
            {label}: {required && <span className="text-danger-500">*</span>}
          </legend>

          <div
            className={cn(
              "mt-2 flex flex-col gap-1",
              dimStyles[dim],
              className,
            )}
          >
            {options.map((option) => (
              <label
                className="flex cursor-pointer items-center rounded p-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                key={option.value}
              >
                <input
                  className={cn(
                    "text-primary-600 focus:ring-primary-500 border-gray-300",
                    radioSizeStyles[dim],
                    error && "border-danger-500 focus:ring-danger-300",
                  )}
                  checked={value === option.value}
                  name={name}
                  onChange={handleChange}
                  required={required}
                  type="radio"
                  value={option.value}
                />
                <span className="ml-2 select-none">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!label && (
        <div className={cn("flex flex-col gap-1", dimStyles[dim], className)}>
          {options.map((option) => (
            <label
              className="flex cursor-pointer items-center rounded p-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              key={option.value}
            >
              <input
                className={cn(
                  "text-primary-600 focus:ring-primary-500 border-gray-300",
                  radioSizeStyles[dim],
                  error && "border-danger-500 focus:ring-danger-300",
                )}
                checked={value === option.value}
                name={name}
                onChange={handleChange}
                required={required}
                type="radio"
                value={option.value}
              />
              <span className="ml-2 select-none">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      <FormError>{error}</FormError>
    </div>
  );
}
