import { renderWithProviders, screen } from "../test-utils";
import NotFound from "../../pages/not-found";

vi.mock("react-router", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
}));

describe("NotFound Component", () => {
  it("renders correctly with dictionary content", () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/404 -/)).toBeInTheDocument();

    const homeLink = screen.getByTestId("link-to-/");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("applies correct CSS classes for styling", () => {
    const { container } = renderWithProviders(<NotFound />);

    const mainContainer = container.firstElementChild;
    expect(mainContainer).toHaveClass("container");
    expect(mainContainer).toHaveClass("mx-auto");
    expect(mainContainer).toHaveClass("px-6");
    expect(mainContainer).toHaveClass("py-14");
    expect(mainContainer).toHaveClass("text-center");
  });

  it("renders heading with correct styling", () => {
    renderWithProviders(<NotFound />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("mb-4");
    expect(heading).toHaveClass("text-2xl");
    expect(heading).toHaveClass("font-bold");
  });

  it("renders description paragraph with correct styling", () => {
    const { container } = renderWithProviders(<NotFound />);

    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveClass("mb-4");
  });

  it("renders link with button styling", () => {
    renderWithProviders(<NotFound />);

    const homeLink = screen.getByTestId("link-to-/");
    expect(homeLink).toHaveClass("btn");
  });

  it("uses real dictionary for translations", () => {
    const { container } = renderWithProviders(<NotFound />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/^404 -/);

    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toBeTruthy();

    const homeLink = container.querySelector('[data-testid="link-to-/"]');
    expect(homeLink?.textContent).toBeTruthy();
  });

  it("renders semantic HTML structure", () => {
    const { container } = renderWithProviders(<NotFound />);

    expect(container.firstElementChild?.tagName.toLowerCase()).toBe("div");

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();

    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
  });

  it("has correct link attributes", () => {
    renderWithProviders(<NotFound />);

    const homeLink = screen.getByTestId("link-to-/");
    expect(homeLink).toHaveAttribute("href", "/");
    expect(homeLink).toHaveAttribute("class", "btn");
  });

  it("renders all elements in correct order", () => {
    const { container } = renderWithProviders(<NotFound />);

    const children = Array.from(container.firstElementChild?.children || []);

    expect(children).toHaveLength(3);
    expect(children[0].tagName.toLowerCase()).toBe("h1");
    expect(children[1].tagName.toLowerCase()).toBe("p");
    expect(children[2].tagName.toLowerCase()).toBe("a");
  });

  it("displays 404 error code prominently", () => {
    renderWithProviders(<NotFound />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/^404/);
  });

  it("provides helpful navigation back to home", () => {
    renderWithProviders(<NotFound />);

    const homeLink = screen.getByTestId("link-to-/");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.getAttribute("href")).toBe("/");
    expect(homeLink).toHaveClass("btn");
  });

  it("renders without crashing", () => {
    expect(() => renderWithProviders(<NotFound />)).not.toThrow();
  });

  it("contains meaningful content from dictionary", () => {
    const { container } = renderWithProviders(<NotFound />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent?.length).toBeGreaterThan(5);

    const paragraph = container.querySelector("p");
    expect(paragraph?.textContent?.length).toBeGreaterThan(10);

    const homeLink = container.querySelector('[data-testid="link-to-/"]');
    expect(homeLink?.textContent?.length).toBeGreaterThan(3);
  });

  it("has proper accessibility structure", () => {
    const { container } = renderWithProviders(<NotFound />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    const homeLink = container.querySelector('[data-testid="link-to-/"]');
    expect(homeLink?.tagName.toLowerCase()).toBe("a");
    expect(homeLink).toHaveAttribute("href");
  });
});
