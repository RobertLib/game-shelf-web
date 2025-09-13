import { render, screen } from "@testing-library/react";
import { type LinkProps } from "react-router";
import Tabs from "../../../components/ui/tabs";

const mockUseLocation = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
    Link: ({ children, to, ...rest }: LinkProps) => (
      <a href={to.toString()} {...rest}>
        {children}
      </a>
    ),
  };
});

const renderWithLocation = (
  ui: React.ReactElement,
  pathname = "/",
  search = "",
) => {
  mockUseLocation.mockReturnValue({ pathname, search });
  return render(ui);
};

describe("Tabs Component", () => {
  const mockItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profil" },
    { href: "/settings", label: "Nastavení" },
  ];

  it("renders correctly with required props", () => {
    renderWithLocation(<Tabs items={mockItems} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profil" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nastavení" })).toBeInTheDocument();
  });

  it("renders all items as links with correct href attributes", () => {
    renderWithLocation(<Tabs items={mockItems} />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    const profileLink = screen.getByRole("link", { name: "Profil" });
    const settingsLink = screen.getByRole("link", { name: "Nastavení" });

    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(profileLink).toHaveAttribute("href", "/profile");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("applies active styling to current tab based on pathname", () => {
    renderWithLocation(<Tabs items={mockItems} />, "/dashboard");

    const dashboardItem = screen
      .getByRole("link", { name: "Dashboard" })
      .closest("li");
    const profileItem = screen
      .getByRole("link", { name: "Profil" })
      .closest("li");

    // Active tab should not have text-gray-500 class
    expect(dashboardItem).not.toHaveClass("text-gray-500");
    // Inactive tabs should have text-gray-500 class
    expect(profileItem).toHaveClass("text-gray-500");
  });

  it("works with partial path matching (startsWith)", () => {
    renderWithLocation(<Tabs items={mockItems} />, "/dashboard/sub-page");

    const dashboardItem = screen
      .getByRole("link", { name: "Dashboard" })
      .closest("li");

    // Active tab should not have text-gray-500 class
    expect(dashboardItem).not.toHaveClass("text-gray-500");
  });

  it("applies custom className to the ul element", () => {
    renderWithLocation(
      <Tabs items={mockItems} className="custom-tabs-class" />,
    );

    const tabsList = screen.getByRole("list");
    expect(tabsList).toHaveClass("custom-tabs-class");
  });

  it("applies default styling classes", () => {
    renderWithLocation(<Tabs items={mockItems} />);

    const tabsList = screen.getByRole("list");
    expect(tabsList).toHaveClass(
      "inline-flex",
      "space-x-1",
      "rounded-md",
      "bg-background",
      "p-1",
    );
  });

  it("renders empty list when no items provided", () => {
    renderWithLocation(<Tabs items={[]} />);

    const tabsList = screen.getByRole("list");
    expect(tabsList).toBeInTheDocument();
    expect(tabsList.children).toHaveLength(0);
  });

  it("passes through additional ul props", () => {
    renderWithLocation(<Tabs items={mockItems} data-testid="custom-tabs" />);

    const tabsList = screen.getByTestId("custom-tabs");
    expect(tabsList).toBeInTheDocument();
  });

  it("handles tabs with same prefix correctly", () => {
    const itemsWithSimilarPaths = [
      { href: "/user", label: "Uživatel" },
      { href: "/users", label: "Uživatelé" },
    ];

    renderWithLocation(<Tabs items={itemsWithSimilarPaths} />, "/users");

    const userItem = screen
      .getByRole("link", { name: "Uživatel" })
      .closest("li");
    const usersItem = screen
      .getByRole("link", { name: "Uživatelé" })
      .closest("li");

    // Both should be active because "/users" starts with "/user"
    expect(userItem).not.toHaveClass("text-gray-500");
    expect(usersItem).not.toHaveClass("text-gray-500");
  });

  it("applies correct styling when no tab matches current path", () => {
    renderWithLocation(<Tabs items={mockItems} />, "/unknown-path");

    const allItems = screen.getAllByRole("listitem");

    allItems.forEach((item) => {
      expect(item).toHaveClass("text-gray-500");
    });
  });

  describe("Loading state", () => {
    it("renders skeleton tabs when loading is true", () => {
      renderWithLocation(<Tabs items={mockItems} loading />);

      // Should render 3 skeleton tabs by default
      const skeletonTabs = screen.getAllByRole("listitem");
      expect(skeletonTabs).toHaveLength(3);

      // Should not render any actual links
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("renders custom number of skeleton tabs when loadingTabsCount is provided", () => {
      renderWithLocation(
        <Tabs items={mockItems} loading loadingTabsCount={5} />,
      );

      const skeletonTabs = screen.getAllByRole("listitem");
      expect(skeletonTabs).toHaveLength(5);
    });

    it("renders normal tabs when loading is false", () => {
      renderWithLocation(<Tabs items={mockItems} loading={false} />);

      expect(
        screen.getByRole("link", { name: "Dashboard" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Profil" })).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Nastavení" }),
      ).toBeInTheDocument();
    });
  });

  describe("Query params support", () => {
    const itemsWithQueryParams = [
      { href: "/dashboard?tab=overview", label: "Přehled" },
      { href: "/dashboard?tab=stats", label: "Statistiky" },
    ];

    it("uses only pathname for active tab detection by default", () => {
      renderWithLocation(
        <Tabs items={itemsWithQueryParams} />,
        "/dashboard",
        "?tab=overview",
      );

      const overviewItem = screen
        .getByRole("link", { name: "Přehled" })
        .closest("li");
      const statsItem = screen
        .getByRole("link", { name: "Statistiky" })
        .closest("li");

      // Both should be active because both hrefs start with "/dashboard"
      // But actually they won't be active because the hrefs include query params
      // and we're only matching against pathname "/dashboard"
      expect(overviewItem).toHaveClass("text-gray-500");
      expect(statsItem).toHaveClass("text-gray-500");
    });

    it("includes query params in active tab detection when includeQueryParams is true", () => {
      renderWithLocation(
        <Tabs items={itemsWithQueryParams} includeQueryParams />,
        "/dashboard",
        "?tab=overview",
      );

      const overviewItem = screen
        .getByRole("link", { name: "Přehled" })
        .closest("li");
      const statsItem = screen
        .getByRole("link", { name: "Statistiky" })
        .closest("li");

      // Only overview should be active because current URL is "/dashboard?tab=overview"
      expect(overviewItem).not.toHaveClass("text-gray-500");
      expect(statsItem).toHaveClass("text-gray-500");
    });

    it("works with partial query param matching", () => {
      renderWithLocation(
        <Tabs items={itemsWithQueryParams} includeQueryParams />,
        "/dashboard",
        "?tab=overview&filter=active",
      );

      const overviewItem = screen
        .getByRole("link", { name: "Přehled" })
        .closest("li");

      // Should be active because "/dashboard?tab=overview&filter=active" starts with "/dashboard?tab=overview"
      expect(overviewItem).not.toHaveClass("text-gray-500");
    });

    it("handles no matching query params correctly when includeQueryParams is true", () => {
      renderWithLocation(
        <Tabs items={itemsWithQueryParams} includeQueryParams />,
        "/dashboard",
        "?tab=other",
      );

      const allItems = screen.getAllByRole("listitem");

      allItems.forEach((item) => {
        expect(item).toHaveClass("text-gray-500");
      });
    });
  });
});
