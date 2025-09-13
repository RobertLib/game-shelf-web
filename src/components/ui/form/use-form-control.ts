import { useCallback, useEffect, useState } from "react";

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
  const [value, setValue] = useState(props.value ?? defaultValue ?? "");

  useEffect(() => {
    if (props.value !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(props.value);
    }
  }, [props.value]);

  const handleChange = useCallback(
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      onChange?.(event);
      setValue(event.target.value);
    },
    [onChange],
  );

  return { value, setValue, handleChange };
}
