import { fireEvent, render, screen } from "../../test-utils";
import RadioGroup from "../../../components/ui/radio-group";

const mockOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

describe("RadioGroup", () => {
  it("renders radio group with options", () => {
    render(<RadioGroup options={mockOptions} name="test" />);

    expect(screen.getByDisplayValue("option1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("option2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("option3")).toBeInTheDocument();

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(
      <RadioGroup options={mockOptions} name="test" label="Choose option" />,
    );

    expect(screen.getByText("Choose option:")).toBeInTheDocument();
  });

  it("renders with required indicator", () => {
    render(
      <RadioGroup
        options={mockOptions}
        name="test"
        label="Choose option"
        required
      />,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders with error", () => {
    render(
      <RadioGroup
        options={mockOptions}
        name="test"
        error="Please select an option"
      />,
    );

    expect(screen.getByText("Please select an option")).toBeInTheDocument();
  });

  it("handles selection change", () => {
    const mockOnChange = vi.fn();
    render(
      <RadioGroup options={mockOptions} name="test" onChange={mockOnChange} />,
    );

    const option2Radio = screen.getByDisplayValue("option2");
    fireEvent.click(option2Radio);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: "option2",
        }),
      }),
    );
  });

  it("renders with default value", () => {
    render(
      <RadioGroup options={mockOptions} name="test" defaultValue="option2" />,
    );

    const option2Radio = screen.getByDisplayValue("option2");
    expect(option2Radio).toBeChecked();
  });

  it("renders with controlled value", () => {
    render(<RadioGroup options={mockOptions} name="test" value="option3" />);

    const option3Radio = screen.getByDisplayValue("option3");
    expect(option3Radio).toBeChecked();
  });

  it("applies different sizes", () => {
    const { rerender } = render(
      <RadioGroup options={mockOptions} name="test" dim="xs" />,
    );

    expect(screen.getByDisplayValue("option1")).toHaveClass("w-3", "h-3");

    rerender(<RadioGroup options={mockOptions} name="test" dim="lg" />);

    expect(screen.getByDisplayValue("option1")).toHaveClass("w-5", "h-5");
  });

  it("applies error styles when error is present", () => {
    render(
      <RadioGroup options={mockOptions} name="test" error="Error message" />,
    );

    const radio = screen.getByDisplayValue("option1");
    expect(radio).toHaveClass("border-danger-500", "focus:ring-danger-300");
  });
});
