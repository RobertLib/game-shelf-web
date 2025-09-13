import { Eye, EyeOff } from "lucide-react";
import { useFormControl } from "./form/use-form-control";
import { useId, useState } from "react";
import Button from "./button";
import cn from "../../utils/cn";
import FormError from "./form/form-error";

interface InputProps extends React.ComponentProps<"input"> {
  dim?: "sm" | "md" | "lg";
  error?: string;
  floating?: boolean;
  label?: string;
}

export default function Input({
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
}: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { value, handleChange } = useFormControl({ ...props, defaultValue });

  const isLabelFloating = isFocused || !!value;

  const inputType =
    props.type === "password"
      ? passwordVisible
        ? "text"
        : "password"
      : (props.type ?? "text");

  const dimStyles = {
    sm: "px-1 py-0 text-sm",
    md: "px-2 py-1 text-base",
    lg: "px-3 py-2 text-lg",
  };

  const generatedId = useId();
  const inputId = name ? `input-${name}` : `input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && !floating && (
        <label className="block truncate text-sm font-medium" htmlFor={inputId}>
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <span
        className={cn("relative", props.type === "password" && "btn-group")}
      >
        {label && floating && (
          <label
            className={cn(
              "pointer-events-none absolute transition-all duration-200",
              isLabelFloating
                ? "bg-surface translate-x-[0.25rem] translate-y-[-0.7rem] px-1 text-xs"
                : "translate-x-[0.5rem] translate-y-[0.4rem] text-gray-500 dark:text-gray-400",
              error && "text-danger-500",
            )}
            htmlFor={inputId}
          >
            {label} {required && <span className="text-danger-500">*</span>}
          </label>
        )}
        <input
          {...props}
          className={cn(
            "form-control px-2 py-1",
            dimStyles[dim],
            disabled && "cursor-not-allowed opacity-50",
            floating && "pt-2",
            error && "border-danger-500! focus:ring-danger-300!",
            className,
          )}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? "true" : undefined}
          aria-required={required ? "true" : undefined}
          disabled={disabled}
          id={props.id || inputId}
          name={name}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onChange={handleChange}
          placeholder={floating ? "" : props.placeholder}
          required={required}
          type={inputType}
          value={value}
        />
        {props.type === "password" && (
          <Button
            aria-label={
              inputType === "password" ? "Show password" : "Hide password"
            }
            aria-pressed={inputType === "text"}
            color="default"
            onClick={() => {
              setPasswordVisible((prev) => !prev);
            }}
          >
            {inputType === "password" ? (
              <Eye size={20} />
            ) : (
              <EyeOff size={20} />
            )}
          </Button>
        )}
      </span>

      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  );
}
