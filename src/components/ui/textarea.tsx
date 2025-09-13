import { useFormControl } from "./form/use-form-control";
import { useId, useState } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  dim?: "sm" | "md" | "lg";
  error?: string;
  floating?: boolean;
  label?: string;
}

export default function Textarea({
  className,
  defaultValue,
  dim = "md",
  disabled,
  error,
  floating = false,
  label,
  name,
  required,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  const { value, handleChange } = useFormControl({ ...props, defaultValue });

  const isLabelFloating = isFocused || !!value;

  const dimStyles = {
    sm: "px-1 py-0 text-sm min-h-[60px]",
    md: "px-2 py-1 text-base min-h-[80px]",
    lg: "px-3 py-2 text-lg min-h-[100px]",
  };

  const generatedId = useId();
  const textareaId = name ? `textarea-${name}` : `textarea-${generatedId}`;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && !floating && (
        <label
          className="block truncate text-sm font-medium"
          htmlFor={textareaId}
        >
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <span className="relative">
        {label && floating && (
          <label
            className={cn(
              "pointer-events-none absolute z-10 transition-all duration-200",
              isLabelFloating
                ? "bg-surface translate-x-[0.25rem] translate-y-[-0.7rem] px-1 text-xs"
                : "translate-x-[0.5rem] translate-y-[0.4rem] text-gray-500 dark:text-gray-400",
              error && "text-danger-500",
            )}
            htmlFor={textareaId}
          >
            {label} {required && <span className="text-danger-500">*</span>}
          </label>
        )}
        <textarea
          {...props}
          className={cn(
            "form-control resize-y px-2 py-1",
            dimStyles[dim],
            disabled && "cursor-not-allowed opacity-50",
            floating && "pt-6",
            error && "border-danger-500! focus:ring-danger-300!",
            className,
          )}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-required={required ? "true" : undefined}
          disabled={disabled}
          id={props.id || textareaId}
          name={name}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onChange={handleChange}
          placeholder={floating ? "" : props.placeholder}
          required={required}
          value={value}
        />
      </span>

      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  );
}
