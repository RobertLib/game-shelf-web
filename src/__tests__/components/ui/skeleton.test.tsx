import { renderWithProviders, screen } from "../../test-utils";
import Skeleton from "../../../components/ui/skeleton";

describe("Skeleton Component", () => {
  it("renders correctly", () => {
    renderWithProviders(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("applies default classes", () => {
    renderWithProviders(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded");
    expect(skeleton).toHaveClass("bg-neutral-100");
    expect(skeleton).toHaveClass("h-4");
    expect(skeleton).toHaveClass("w-full");
  });

  it("applies custom height prop", () => {
    renderWithProviders(<Skeleton height="h-10" data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("h-10");
    expect(skeleton).not.toHaveClass("h-4");
  });

  it("applies custom width prop", () => {
    renderWithProviders(<Skeleton width="w-32" data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("w-32");
    expect(skeleton).not.toHaveClass("w-full");
  });

  it("applies custom className prop", () => {
    renderWithProviders(
      <Skeleton className="custom-class" data-testid="skeleton" />,
    );

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("custom-class");
  });

  it("combines all custom props correctly", () => {
    renderWithProviders(
      <Skeleton
        height="h-8"
        width="w-48"
        className="mb-4"
        data-testid="skeleton"
      />,
    );

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded");
    expect(skeleton).toHaveClass("bg-neutral-100");
    expect(skeleton).toHaveClass("h-8");
    expect(skeleton).toHaveClass("w-48");
    expect(skeleton).toHaveClass("mb-4");
  });

  it("renders as a div element", () => {
    renderWithProviders(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton.tagName).toBe("DIV");
  });
});
