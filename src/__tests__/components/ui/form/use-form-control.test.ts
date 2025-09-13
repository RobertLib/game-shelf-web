import { act, renderHook } from "@testing-library/react";
import { useFormControl } from "../../../../components/ui/form/use-form-control";

describe("useFormControl", () => {
  it("initializes with default value", () => {
    const { result } = renderHook(() =>
      useFormControl({ defaultValue: "initial" }),
    );

    expect(result.current.value).toBe("initial");
  });

  it("initializes with empty string when no default value", () => {
    const { result } = renderHook(() => useFormControl({}));

    expect(result.current.value).toBe("");
  });

  it("updates value when handleChange is called", () => {
    const { result } = renderHook(() => useFormControl({}));

    const mockEvent = {
      target: { value: "new value" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(mockEvent);
    });

    expect(result.current.value).toBe("new value");
  });

  it("calls external onChange when provided", () => {
    const mockOnChange = vi.fn();
    const { result } = renderHook(() =>
      useFormControl({ onChange: mockOnChange }),
    );

    const mockEvent = {
      target: { value: "test" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(mockEvent);
    });

    expect(mockOnChange).toHaveBeenCalledWith(mockEvent);
    expect(result.current.value).toBe("test");
  });

  it("updates value when controlled value prop changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormControl({ value }),
      {
        initialProps: { value: "initial" },
      },
    );

    expect(result.current.value).toBe("initial");

    rerender({ value: "updated" });

    expect(result.current.value).toBe("updated");
  });

  it("prefers controlled value over default value", () => {
    const { result } = renderHook(() =>
      useFormControl({ value: "controlled", defaultValue: "default" }),
    );

    expect(result.current.value).toBe("controlled");
  });

  it("handles setValue function", () => {
    const { result } = renderHook(() => useFormControl({}));

    act(() => {
      result.current.setValue("manual value");
    });

    expect(result.current.value).toBe("manual value");
  });

  it("works with different input types", () => {
    const { result } = renderHook(() => useFormControl({}));

    const textareaEvent = {
      target: { value: "textarea content" },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    act(() => {
      result.current.handleChange(textareaEvent);
    });

    expect(result.current.value).toBe("textarea content");

    const selectEvent = {
      target: { value: "option1" },
    } as React.ChangeEvent<HTMLSelectElement>;

    act(() => {
      result.current.handleChange(selectEvent);
    });

    expect(result.current.value).toBe("option1");
  });

  it("handles number values", () => {
    const { result } = renderHook(() => useFormControl({ defaultValue: 42 }));

    expect(result.current.value).toBe(42);
  });

  it("handles array values", () => {
    const arrayValue = ["option1", "option2"];
    const { result } = renderHook(() =>
      useFormControl({ defaultValue: arrayValue }),
    );

    expect(result.current.value).toBe(arrayValue);
  });
});
