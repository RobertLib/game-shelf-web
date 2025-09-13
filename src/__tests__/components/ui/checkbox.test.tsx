import { render, screen, fireEvent } from "@testing-library/react";
import Checkbox from "../../../components/ui/checkbox";

describe("Checkbox", () => {
  it("should render without label", () => {
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("should render with label", () => {
    render(<Checkbox label="Test label" data-testid="checkbox" />);

    const label = screen.getByText("Test label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for");
  });

  it("should render with description", () => {
    render(
      <Checkbox
        label="Test label"
        description="Test description"
        data-testid="checkbox"
      />,
    );

    const description = screen.getByText("Test description");
    expect(description).toBeInTheDocument();
  });

  it("should show required asterisk when required", () => {
    render(<Checkbox label="Test label" required data-testid="checkbox" />);

    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass("text-danger-500");
  });

  it("should be checked when defaultChecked is true", () => {
    render(<Checkbox defaultChecked data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should call onChange when clicked", () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("should display error message", () => {
    render(<Checkbox error="Test error" data-testid="checkbox" />);

    const error = screen.getByTestId("form-error");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent("Test error");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Checkbox disabled data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("should work in controlled mode", () => {
    const { rerender } = render(
      <Checkbox checked={false} data-testid="checkbox" />,
    );

    let checkbox = screen.getByTestId("checkbox");
    expect(checkbox).not.toBeChecked();

    rerender(<Checkbox checked={true} data-testid="checkbox" />);
    checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeChecked();
  });
});
