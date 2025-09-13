import {
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import Input from "../../../components/ui/input";

describe("Input Component", () => {
  it("renders correctly with default props", () => {
    renderWithProviders(<Input name="test" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders with label", () => {
    renderWithProviders(<Input name="test" label="Test Label" />);
    const label = screen.getByText("Test Label:");
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe("label");

    const input = screen.getByLabelText("Test Label:");
    expect(input).toBeInTheDocument();
  });

  it("renders with required indicator when required is true", () => {
    renderWithProviders(<Input name="test" label="Required Field" required />);
    const requiredIndicator = screen.getByText("*");
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveClass("text-danger-500");
  });

  it("displays error message when error prop is provided", () => {
    renderWithProviders(<Input name="test" error="This field is required" />);
    const errorMessage = screen.getByTestId("form-error");
    expect(errorMessage).toHaveTextContent("This field is required");
  });

  it("applies error styling when error prop is provided", () => {
    renderWithProviders(<Input name="test" error="Error message" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-danger-500!");
    expect(input.className).toContain("focus:ring-danger-300!");
  });

  it("toggles password visibility when password toggle button is clicked", () => {
    renderWithProviders(
      <Input name="password" type="password" data-testid="password-input" />,
    );

    const input = screen.getByTestId("password-input");
    expect(input).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", { name: "Show password" });
    fireEvent.click(toggleButton);

    expect(input).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("applies different size styles based on dim prop", () => {
    renderWithProviders(<Input name="test" dim="sm" data-testid="input" />);
    let input = screen.getByTestId("input");
    expect(input.className).toContain("px-1 py-0 text-sm");

    rerenderWithProviders(<Input name="test" dim="md" data-testid="input" />);
    input = screen.getByTestId("input");
    expect(input.className).toContain("px-2 py-1 text-base");

    rerenderWithProviders(<Input name="test" dim="lg" data-testid="input" />);
    input = screen.getByTestId("input");
    expect(input.className).toContain("px-3 py-2 text-lg");
  });

  it("handles floating label correctly when focusing and blurring", () => {
    renderWithProviders(
      <Input name="test" label="Floating Label" floating data-testid="input" />,
    );
    const input = screen.getByTestId("input");
    const label = screen.getByText("Floating Label");

    expect(label.className).toContain(
      "translate-x-[0.5rem] translate-y-[0.4rem]",
    );
    expect(label.className).toContain("text-gray-500");

    fireEvent.focus(input);
    expect(label.className).toContain(
      "translate-x-[0.25rem] translate-y-[-0.7rem]",
    );
    expect(label.className).toContain("text-xs");

    fireEvent.blur(input);
    expect(label.className).toContain(
      "translate-x-[0.5rem] translate-y-[0.4rem]",
    );

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "test value" } });
    fireEvent.blur(input);
    expect(label.className).toContain(
      "translate-x-[0.25rem] translate-y-[-0.7rem]",
    );
  });

  it("applies custom className", () => {
    renderWithProviders(
      <Input name="test" className="custom-class" data-testid="input" />,
    );
    const input = screen.getByTestId("input");
    expect(input.className).toContain("custom-class");
  });

  it("sets correct aria attributes", () => {
    renderWithProviders(
      <Input name="test" required error="Error message" data-testid="input" />,
    );

    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-describedby");

    const errorId = input.getAttribute("aria-describedby");
    const errorMessage = screen.getByTestId("form-error");
    expect(errorMessage).toHaveAttribute("id", errorId);
  });

  it("updates value when input changes", () => {
    renderWithProviders(<Input name="test" data-testid="input" />);
    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "new value" } });
    expect(input).toHaveValue("new value");
  });
});
