import { renderWithProviders, screen } from "../../test-utils";
import Navbar from "../../../components/ui/navbar";

describe("Navbar Component", () => {
  it("renders correctly with default props", () => {
    const { container } = renderWithProviders(<Navbar />);

    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();

    // Check for navigation aria-label instead of missing text
    expect(screen.getByLabelText("Main navigation")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Navbar className="custom-class" />,
    );

    const nav = container.querySelector("nav") as HTMLElement;
    expect(nav.className).toContain("custom-class");
    expect(nav.className).toContain("flex");
    expect(nav.className).toContain("items-center");
    expect(nav.className).toContain("justify-between");
  });

  it("passes additional props to nav element", () => {
    renderWithProviders(
      <Navbar data-testid="test-navbar" aria-label="Main navigation" />,
    );

    const navElement = screen.getByTestId("test-navbar");
    expect(navElement).toBeInTheDocument();
    expect(navElement).toHaveAttribute("aria-label", "Main navigation");
  });
});
