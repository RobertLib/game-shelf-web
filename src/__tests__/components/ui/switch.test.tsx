import {
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import Switch from "../../../components/ui/switch";

describe("Switch Component", () => {
  it("renders correctly", () => {
    renderWithProviders(<Switch data-testid="switch-input" />);

    const switchInput = screen.getByTestId("switch-input");
    expect(switchInput).toBeInTheDocument();
    expect(switchInput).toHaveAttribute("type", "checkbox");
    expect(switchInput).toHaveAttribute("role", "switch");
  });

  it("renders with label", () => {
    renderWithProviders(<Switch label="Toggle me" />);

    const label = screen.getByText("Toggle me");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("id");
    expect(label.id).toMatch(/switch-.*-label/);
  });

  it("uses correct ARIA attributes", () => {
    const handleChange = vi.fn();
    renderWithProviders(
      <Switch
        label="Toggle me"
        checked
        onChange={handleChange}
        data-testid="switch-input"
      />,
    );

    const switchInput = screen.getByTestId("switch-input");
    expect(switchInput).toHaveAttribute("aria-checked", "true");
    expect(switchInput).toHaveAttribute("aria-labelledby");
    expect(switchInput.getAttribute("aria-labelledby")).toMatch(
      /switch-.*-label/,
    );
  });

  it("has accessible toggle control", () => {
    renderWithProviders(<Switch label="Toggle me" />);

    const toggleVisual = screen.getByLabelText("Toggle me").nextElementSibling;
    expect(toggleVisual).toHaveAttribute("aria-hidden", "true");
  });

  it("applies default classes", () => {
    const { container } = renderWithProviders(<Switch />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("flex-col");
    expect(wrapper).toHaveClass("gap-1.5");

    const label = wrapper?.firstChild;
    expect(label).toHaveClass("inline-flex");
    expect(label).toHaveClass("cursor-pointer");
    expect(label).toHaveClass("items-center");
  });

  it("combines custom className with default classes", () => {
    const { container } = renderWithProviders(
      <Switch className="custom-class" />,
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("flex-col");
    expect(wrapper).toHaveClass("gap-1.5");

    const label = wrapper?.firstChild;
    expect(label).toHaveClass("custom-class");
    expect(label).toHaveClass("inline-flex");
  });

  it("forwards props to input element", () => {
    const handleChange = vi.fn();
    renderWithProviders(
      <Switch
        data-testid="switch-input"
        name="test-switch"
        disabled
        checked
        onChange={handleChange}
      />,
    );

    const switchInput = screen.getByTestId("switch-input");
    expect(switchInput).toHaveAttribute("name", "test-switch");
    expect(switchInput).toBeDisabled();
    expect(switchInput).toBeChecked();
  });

  it("fires onChange event when clicked", () => {
    const handleChange = vi.fn();
    renderWithProviders(<Switch onChange={handleChange} label="Toggle me" />);

    fireEvent.click(screen.getByLabelText("Toggle me"));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("applies correct classes to different states", () => {
    const handleChange = vi.fn();
    const { container } = renderWithProviders(
      <Switch
        data-testid="switch-input"
        checked={false}
        onChange={handleChange}
      />,
    );

    const toggleVisual = container.querySelector("div[aria-hidden='true']");
    expect(toggleVisual).toHaveClass("bg-gray-200");

    rerenderWithProviders(
      <Switch
        data-testid="switch-input"
        checked={true}
        onChange={handleChange}
      />,
    );

    const toggleContainer = container.querySelector("div[aria-hidden='true']");
    expect(toggleContainer?.className).toContain("peer-checked:bg-primary-600");
    expect(toggleContainer?.className).toContain("peer-focus:ring-primary-300");
  });
});
