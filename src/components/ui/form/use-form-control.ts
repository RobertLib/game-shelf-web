import { useCallback, useState } from "react";

export function useFormControl({
  defaultValue,
  onChange,
  ...props
}: {
  defaultValue?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;
  value?: string | number | readonly string[];
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  const value = props.value !== undefined ? props.value : internalValue;

  const handleChange = useCallback(
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      onChange?.(event);
      if (props.value === undefined) {
        setInternalValue(event.target.value);
      }
    },
    [onChange, props.value],
  );

  return { value, setValue: setInternalValue, handleChange };
}
