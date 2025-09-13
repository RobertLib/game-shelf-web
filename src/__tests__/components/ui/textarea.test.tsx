import {
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import Textarea from "../../../components/ui/textarea";

describe("Textarea Component", () => {
  it("renders correctly with default props", () => {
    renderWithProviders(<Textarea name="test" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName.toLowerCase()).toBe("textarea");
  });

  it("renders with label", () => {
    renderWithProviders(<Textarea name="test" label="Test Label" />);
    const label = screen.getByText("Test Label:");
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe("label");

    const textarea = screen.getByLabelText("Test Label:");
    expect(textarea).toBeInTheDocument();
  });

  it("renders with required indicator when required is true", () => {
    renderWithProviders(
      <Textarea name="test" label="Required Field" required />,
    );
    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass("text-danger-500");
  });

  it("displays error message when error prop is provided", () => {
    renderWithProviders(
      <Textarea name="test" error="This field is required" />,
    );
    const errorMessage = screen.getByTestId("form-error");
    expect(errorMessage).toHaveTextContent("This field is required");
  });

  it("applies error styling when error prop is provided", () => {
    renderWithProviders(<Textarea name="test" error="Error message" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.className).toContain("border-danger-500!");
    expect(textarea.className).toContain("focus:ring-danger-300!");
  });

  it("applies different size styles based on dim prop", () => {
    renderWithProviders(
      <Textarea name="test" dim="sm" data-testid="textarea" />,
    );
    let textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("px-1 py-0 text-sm min-h-[60px]");

    rerenderWithProviders(
      <Textarea name="test" dim="md" data-testid="textarea" />,
    );
    textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("px-2 py-1 text-base min-h-[80px]");

    rerenderWithProviders(
      <Textarea name="test" dim="lg" data-testid="textarea" />,
    );
    textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("px-3 py-2 text-lg min-h-[100px]");
  });

  it("handles floating label correctly when focusing and blurring", () => {
    renderWithProviders(
      <Textarea
        name="test"
        label="Floating Label"
        floating
        data-testid="textarea"
      />,
    );
    const textarea = screen.getByTestId("textarea");
    const label = screen.getByText("Floating Label");

    expect(label.className).toContain(
      "translate-x-[0.5rem] translate-y-[0.4rem]",
    );
    expect(label.className).toContain("text-gray-500");

    fireEvent.focus(textarea);
    expect(label.className).toContain(
      "translate-x-[0.25rem] translate-y-[-0.7rem]",
    );
    expect(label.className).toContain("text-xs");

    fireEvent.blur(textarea);
    expect(label.className).toContain(
      "translate-x-[0.5rem] translate-y-[0.4rem]",
    );

    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "test value" } });
    fireEvent.blur(textarea);
    expect(label.className).toContain(
      "translate-x-[0.25rem] translate-y-[-0.7rem]",
    );
  });

  it("applies custom className", () => {
    renderWithProviders(
      <Textarea name="test" className="custom-class" data-testid="textarea" />,
    );
    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("custom-class");
  });

  it("sets correct aria attributes", () => {
    renderWithProviders(
      <Textarea
        name="test"
        required
        error="Error message"
        data-testid="textarea"
      />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-required", "true");
    expect(textarea).toHaveAttribute("aria-describedby");

    const errorId = textarea.getAttribute("aria-describedby");
    const errorMessage = screen.getByTestId("form-error");
    expect(errorMessage).toHaveAttribute("id", errorId);
  });

  it("updates value when textarea changes", () => {
    renderWithProviders(<Textarea name="test" data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");

    fireEvent.change(textarea, { target: { value: "new value" } });
    expect(textarea).toHaveValue("new value");
  });

  it("applies resize-y class for vertical resizing", () => {
    renderWithProviders(<Textarea name="test" data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("resize-y");
  });

  it("applies correct padding when floating label is used", () => {
    renderWithProviders(
      <Textarea
        name="test"
        label="Floating Label"
        floating
        data-testid="textarea"
      />,
    );
    const textarea = screen.getByTestId("textarea");
    expect(textarea.className).toContain("pt-6");
  });

  it("supports multiline text input", () => {
    renderWithProviders(<Textarea name="test" data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");

    const multilineText = "Line 1\nLine 2\nLine 3";
    fireEvent.change(textarea, { target: { value: multilineText } });
    expect(textarea).toHaveValue(multilineText);
  });
});
