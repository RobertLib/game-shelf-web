import { renderWithProviders, screen } from "../test-utils";
import Home from "../../pages/home";

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
    mockNavigate(to, replace);
    return <div data-testid="navigate" data-to={to} data-replace={replace} />;
  },
}));

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /users with replace option", () => {
    renderWithProviders(<Home />);

    expect(mockNavigate).toHaveBeenCalledWith("/users", true);
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    const navigateElement = screen.getByTestId("navigate");
    expect(navigateElement).toHaveAttribute("data-to", "/users");
    expect(navigateElement).toHaveAttribute("data-replace", "true");
  });

  it("uses replace navigation to prevent back button issues", () => {
    renderWithProviders(<Home />);

    const navigateElement = document.querySelector('[data-testid="navigate"]');
    expect(navigateElement).toHaveAttribute("data-replace", "true");
  });

  it("redirects to users page consistently", () => {
    for (let i = 0; i < 3; i++) {
      const { unmount } = renderWithProviders(<Home />);
      expect(mockNavigate).toHaveBeenCalledWith("/users", true);
      unmount();
    }

    expect(mockNavigate).toHaveBeenCalledTimes(3);
  });

  it("component structure matches expected redirect pattern", () => {
    const { container } = renderWithProviders(<Home />);

    expect(container.firstElementChild?.tagName.toLowerCase()).toBe("div");
    expect(container.firstElementChild).toHaveAttribute(
      "data-testid",
      "navigate",
    );
    expect(container.firstElementChild).toHaveAttribute("data-to", "/users");
  });

  it("handles component mounting and unmounting without errors", () => {
    expect(() => {
      const { unmount } = renderWithProviders(<Home />);
      unmount();
    }).not.toThrow();
  });
});
