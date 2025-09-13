import { renderWithProviders, screen } from "../../test-utils";
import Button from "../../../components/ui/button";

describe("Button Component", () => {
  it("renders correctly with default props", () => {
    renderWithProviders(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute("aria-busy", "true");
  });

  it("renders children correctly", () => {
    renderWithProviders(<Button>Test Button</Button>);
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithProviders(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("custom-class");
  });

  it("displays loading spinner when loading is true", () => {
    renderWithProviders(<Button loading>Loading Button</Button>);
    const svg = screen.getByRole("status");
    expect(svg).toBeInTheDocument();
    expect(screen.getByText("Loading Button")).toBeInTheDocument();
  });

  it("disables the button when loading is true", () => {
    renderWithProviders(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("disables the button when disabled is true", () => {
    renderWithProviders(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("sets the correct button type", () => {
    renderWithProviders(<Button type="submit">Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");

    renderWithProviders(<Button>Default</Button>);
    const defaultButton = screen.getByText("Default");
    expect(defaultButton).toHaveAttribute("type", "button");
  });

  it("applies size styles correctly", () => {
    const { rerender } = renderWithProviders(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("px-2 py-0.5 text-sm");

    rerender(<Button size="lg">Large</Button>);
    expect(button.className).toContain("px-4 py-1.5 text-lg");

    rerender(<Button size="icon">Icon</Button>);
    expect(button.className).toContain("p-2 aspect-square");
  });

  it("applies color and variant styles correctly", () => {
    const { rerender } = renderWithProviders(
      <Button color="primary" variant="solid">
        Primary
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-gradient-to-r");
    expect(button.className).toContain("from-primary-500");

    rerender(
      <Button color="danger" variant="solid">
        Danger
      </Button>,
    );
    expect(button.className).toContain("from-danger-500");

    rerender(
      <Button color="primary" variant="outline">
        Outline
      </Button>,
    );
    expect(button.className).toContain("bg-transparent");
    expect(button.className).toContain("border-[1.5px]");

    rerender(
      <Button color="primary" variant="ghost">
        Ghost
      </Button>,
    );
    expect(button.className).toContain("bg-transparent");
    expect(button.className).toContain("border-transparent");
  });

  it("applies default props correctly", () => {
    renderWithProviders(<Button>Default Button</Button>);
    const button = screen.getByRole("button");
    // Default color is primary, variant is solid, size is md
    expect(button.className).toContain("bg-gradient-to-r");
    expect(button.className).toContain("from-primary-500");
    expect(button.className).toContain("px-3 py-1 text-base");
  });

  it("handles link prop correctly", () => {
    renderWithProviders(<Button link="/test">Link Button</Button>);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveTextContent("Link Button");
  });

  it("passes through button props correctly", () => {
    const handleClick = vi.fn();
    renderWithProviders(
      <Button onClick={handleClick} data-testid="test-button">
        Click me
      </Button>,
    );
    const button = screen.getByTestId("test-button");
    expect(button).toBeInTheDocument();

    button.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
