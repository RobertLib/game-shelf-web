import { renderWithProviders, screen } from "../../test-utils";
import Spinner from "../../../components/ui/spinner";

describe("Spinner Component", () => {
  it("renders correctly", () => {
    renderWithProviders(<Spinner data-testid="spinner" />);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("contains SVG element with default size", () => {
    const { container } = renderWithProviders(<Spinner />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
    expect(svg).toHaveClass("h-6");
    expect(svg).toHaveClass("w-6");
  });

  it("applies default classes", () => {
    renderWithProviders(<Spinner data-testid="spinner" />);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toHaveClass("flex");
    expect(spinner).toHaveClass("items-center");
    expect(spinner).toHaveClass("justify-center");
  });

  it("combines custom className with default classes", () => {
    renderWithProviders(
      <Spinner className="custom-class" data-testid="spinner" />,
    );

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toHaveClass("custom-class");
    expect(spinner).toHaveClass("flex");
    expect(spinner).toHaveClass("items-center");
    expect(spinner).toHaveClass("justify-center");
  });

  it("forwards additional props to div element", () => {
    renderWithProviders(<Spinner aria-label="Loading" role="status" />);

    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-label", "Loading");
    expect(spinner).toHaveAttribute("role", "status");
  });

  it("renders different sizes correctly", () => {
    const sizes = [
      { size: "sm", classes: ["h-4", "w-4"] },
      { size: "md", classes: ["h-6", "w-6"] },
      { size: "lg", classes: ["h-8", "w-8"] },
      { size: "xl", classes: ["h-12", "w-12"] },
    ] as const;

    sizes.forEach(({ size, classes }) => {
      const { container } = renderWithProviders(<Spinner size={size} />);
      const svg = container.querySelector("svg");

      expect(svg).toBeInTheDocument();
      classes.forEach((cls) => {
        expect(svg).toHaveClass(cls);
      });
    });
  });

  it("uses default size when size prop is not provided", () => {
    const { container } = renderWithProviders(<Spinner />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveClass("h-6");
    expect(svg).toHaveClass("w-6");
  });

  it("has correct SVG structure", () => {
    const { container } = renderWithProviders(<Spinner />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
    expect(svg).toHaveAttribute("fill", "none");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");

    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveClass("opacity-25");
    expect(circle).toHaveAttribute("cx", "12");
    expect(circle).toHaveAttribute("cy", "12");
    expect(circle).toHaveAttribute("r", "10");

    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass("opacity-75");
  });
});
