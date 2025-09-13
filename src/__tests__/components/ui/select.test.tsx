import {
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import Select from "../../../components/ui/select";

describe("Select Component", () => {
  const mockOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  it("renders correctly with required props", () => {
    renderWithProviders(<Select name="test-select" options={mockOptions} />);

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveAttribute("name", "test-select");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Option 1");
    expect(options[1]).toHaveTextContent("Option 2");
    expect(options[2]).toHaveTextContent("Option 3");
  });

  it("renders with label", () => {
    renderWithProviders(
      <Select name="test-select" options={mockOptions} label="Test Label" />,
    );

    expect(screen.getByText("Test Label:")).toBeInTheDocument();
  });

  it("shows required indicator when required prop is true", () => {
    renderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        label="Test Label"
        required
      />,
    );

    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toHaveClass("text-danger-500");
  });

  it("shows error message when error prop is provided", () => {
    renderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        error="This field is required"
      />,
    );

    const errorElement = screen.getByTestId("form-error");
    expect(errorElement).toHaveTextContent("This field is required");
  });

  it("renders with different dimensions", () => {
    renderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        dim="xs"
        data-testid="select"
      />,
    );

    let selectElement = screen.getByTestId("select");
    expect(selectElement).toHaveClass("px-1");
    expect(selectElement).toHaveClass("py-0.5");
    expect(selectElement).toHaveClass("text-sm");

    rerenderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        dim="sm"
        data-testid="select"
      />,
    );

    selectElement = screen.getByTestId("select");
    expect(selectElement).toHaveClass("px-1");
    expect(selectElement).toHaveClass("py-1");
    expect(selectElement).toHaveClass("text-sm");

    rerenderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        dim="lg"
        data-testid="select"
      />,
    );

    selectElement = screen.getByTestId("select");
    expect(selectElement).toHaveClass("px-3");
    expect(selectElement).toHaveClass("py-3");
    expect(selectElement).toHaveClass("text-lg");
  });

  it("renders empty option when hasEmpty is true", () => {
    renderWithProviders(
      <Select name="test-select" options={mockOptions} hasEmpty />,
    );

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue("");
  });

  it("applies default value", () => {
    renderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        defaultValue="option2"
      />,
    );

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toHaveValue("option2");
  });

  it("applies error classes when error is provided", () => {
    renderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        error="This is an error"
        data-testid="select"
      />,
    );

    const selectElement = screen.getByTestId("select");
    expect(selectElement.className).toContain("border-danger-500!");
    expect(selectElement.className).toContain("focus:ring-danger-300!");
  });

  it("forwards onChange handler", () => {
    const handleChange = vi.fn();
    renderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        onChange={handleChange}
      />,
    );

    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: "option2" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("applies required attribute when required prop is true", () => {
    renderWithProviders(
      <Select name="test-select" options={mockOptions} required />,
    );

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeRequired();
  });

  it("combines custom className with default classes", () => {
    renderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        className="custom-class"
        data-testid="select"
      />,
    );

    const selectElement = screen.getByTestId("select");
    expect(selectElement).toHaveClass("custom-class");
    expect(selectElement).toHaveClass("form-control");
  });

  it("forwards additional props to select element", () => {
    renderWithProviders(
      <Select
        name="test-select"
        options={mockOptions}
        data-testid="select-test"
        aria-describedby="select-description"
      />,
    );

    const selectElement = screen.getByTestId("select-test");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveAttribute(
      "aria-describedby",
      "select-description",
    );
  });
});
