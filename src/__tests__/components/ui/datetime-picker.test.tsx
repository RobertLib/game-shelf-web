import { fireEvent, render, screen } from "@testing-library/react";
import DateTimePicker from "../../../components/ui/datetime-picker";

describe("DateTimePicker", () => {
  it("renders with default props", () => {
    render(<DateTimePicker />);
    const input = screen.getByPlaceholderText("DD.MM.YYYY");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "date");
  });

  it("renders with label", () => {
    render(<DateTimePicker label="Date of Birth" />);
    expect(screen.getByText("Date of Birth:")).toBeInTheDocument();
  });

  it("renders with required label", () => {
    render(<DateTimePicker label="Date of Birth" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders with error", () => {
    render(<DateTimePicker error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("renders with different types", () => {
    const { rerender } = render(<DateTimePicker type="date" />);
    expect(screen.getByPlaceholderText("DD.MM.YYYY")).toHaveAttribute(
      "type",
      "date",
    );

    rerender(<DateTimePicker type="time" />);
    expect(screen.getByPlaceholderText("HH:MM")).toHaveAttribute(
      "type",
      "time",
    );

    rerender(<DateTimePicker type="datetime-local" />);
    expect(screen.getByPlaceholderText("DD.MM.YYYY HH:MM")).toHaveAttribute(
      "type",
      "datetime-local",
    );
  });

  it("renders with correct placeholders", () => {
    const { rerender } = render(<DateTimePicker type="date" />);
    expect(screen.getByPlaceholderText("DD.MM.YYYY")).toHaveAttribute(
      "placeholder",
      "DD.MM.YYYY",
    );

    rerender(<DateTimePicker type="time" />);
    expect(screen.getByPlaceholderText("HH:MM")).toHaveAttribute(
      "placeholder",
      "HH:MM",
    );

    rerender(<DateTimePicker type="datetime-local" />);
    expect(screen.getByPlaceholderText("DD.MM.YYYY HH:MM")).toHaveAttribute(
      "placeholder",
      "DD.MM.YYYY HH:MM",
    );
  });

  it("renders with custom placeholder", () => {
    render(<DateTimePicker placeholder="Custom placeholder" />);
    expect(screen.getByPlaceholderText("Custom placeholder")).toHaveAttribute(
      "placeholder",
      "Custom placeholder",
    );
  });

  it("renders with different dimensions", () => {
    const { rerender } = render(<DateTimePicker dim="sm" />);
    expect(screen.getByPlaceholderText("DD.MM.YYYY")).toHaveClass(
      "px-1",
      "py-0",
      "text-sm",
    );

    rerender(<DateTimePicker dim="md" />);
    expect(screen.getByPlaceholderText("DD.MM.YYYY")).toHaveClass(
      "px-2",
      "py-1",
      "text-base",
    );

    rerender(<DateTimePicker dim="lg" />);
    expect(screen.getByPlaceholderText("DD.MM.YYYY")).toHaveClass(
      "px-3",
      "py-2",
      "text-lg",
    );
  });

  it("handles change events", () => {
    const handleChange = vi.fn();
    render(<DateTimePicker onChange={handleChange} />);
    const input = screen.getByPlaceholderText("DD.MM.YYYY");

    fireEvent.change(input, { target: { value: "2024-01-01" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("applies error styling", () => {
    render(<DateTimePicker error="Error message" />);
    const input = screen.getByPlaceholderText("DD.MM.YYYY");
    expect(input).toHaveClass("border-danger-500!");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("generates correct ids", () => {
    render(<DateTimePicker name="birthdate" />);
    const input = screen.getByPlaceholderText("DD.MM.YYYY");
    expect(input).toHaveAttribute("id", "datetime-input-birthdate");
  });

  it("handles required attribute", () => {
    render(<DateTimePicker required />);
    const input = screen.getByPlaceholderText("DD.MM.YYYY");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("applies custom className", () => {
    render(<DateTimePicker className="custom-class" />);
    const input = screen.getByPlaceholderText("DD.MM.YYYY");
    expect(input).toHaveClass("custom-class");
  });

  it("renders with defaultValue", () => {
    render(<DateTimePicker defaultValue="2024-01-01" />);
    const input = screen.getByDisplayValue("2024-01-01");
    expect(input).toHaveValue("2024-01-01");
  });
});
