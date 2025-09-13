import {
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import { useLocation, type LinkProps } from "react-router";
import * as React from "react";
import Drawer from "../../../components/ui/drawer";
import useIsMobile from "../../../hooks/use-is-mobile";
import useIsMounted from "../../../hooks/use-is-mounted";

vi.mock("../../../contexts/drawer-context", () => ({
  default: {
    value: vi.fn(() => ({
      isCollapsed: false,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    })),
  },
  DrawerProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../../hooks/use-is-mobile", () => ({
  default: vi.fn(() => false),
}));

vi.mock("../../../hooks/use-is-mounted", () => ({
  default: vi.fn(() => true),
}));

vi.mock("react-router", () => ({
  Link: ({ children, to, className, onClick, ...props }: LinkProps) => (
    <a
      href={to.toString()}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </a>
  ),
  useLocation: vi.fn(() => ({ pathname: "/" })),
}));

vi.mock("../../../components/ui/overlay", () => ({
  default: ({ onClick, onKeyDown, ...props }: Record<string, () => void>) => (
    <div
      data-testid="overlay"
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...props}
    />
  ),
}));

vi.mock("../../../components/ui/popover", () => ({
  default: ({ children, open }: Record<string, React.ReactNode>) =>
    open ? <div data-testid="popover">{children}</div> : null,
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    use: vi.fn(() => ({
      isCollapsed: false,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    })),
  };
});

describe("Drawer Component", () => {
  const mockItems = [
    {
      href: "/users",
      icon: <span data-testid="users-icon">👤</span>,
      label: "Users",
    },
    {
      href: "/settings",
      icon: <span data-testid="settings-icon">⚙️</span>,
      label: "Settings",
    },
    {
      label: "Management",
      icon: <span data-testid="management-icon">📊</span>,
      children: [
        {
          href: "/management/overview",
          label: "Overview",
        },
        {
          href: "/management/reports",
          label: "Reports",
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLocation).mockReturnValue({ pathname: "/" } as ReturnType<
      typeof useLocation
    >);
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: false,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });
  });

  it("renders drawer with items correctly", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Management")).toBeInTheDocument();
  });

  it("renders link items correctly", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const usersLink = screen.getByText("Users").closest("a");
    expect(usersLink).toHaveAttribute("href", "/users");

    const settingsLink = screen.getByText("Settings").closest("a");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("renders icons for items", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
    expect(screen.getByTestId("management-icon")).toBeInTheDocument();
  });

  it("renders expandable items with children", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const managementButton = screen.getByText("Management").closest("button");
    expect(managementButton).toBeInTheDocument();
  });

  it("expands submenu when parent item is clicked", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const managementButton = screen.getByText("Management").closest("button");
    fireEvent.click(managementButton!);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });

  it("shows chevron icon for expandable items", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const chevronIcon = document.querySelector(".lucide-chevron-right");
    expect(chevronIcon).toBeInTheDocument();
  });

  it("renders without crashing when items array is empty", () => {
    expect(() => renderWithProviders(<Drawer items={[]} />)).not.toThrow();
  });

  it("handles items without icons", () => {
    const itemsWithoutIcons = [
      {
        href: "/no-icon",
        label: "No Icon Item",
      },
    ];

    renderWithProviders(<Drawer items={itemsWithoutIcons} />);

    expect(screen.getByText("No Icon Item")).toBeInTheDocument();
  });

  it("applies correct aria-hidden attribute based on isOpen state", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const drawer = screen.getByRole("navigation").closest("aside");
    expect(drawer).toHaveAttribute("aria-hidden", "false");

    vi.mocked(React.use).mockReturnValue({
      isCollapsed: false,
      isOpen: false,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    rerenderWithProviders(<Drawer items={mockItems} />);
    expect(drawer).toHaveAttribute("aria-hidden", "true");
  });

  it("applies closed classes when drawer is closed", () => {
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: false,
      isOpen: false,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    renderWithProviders(<Drawer items={mockItems} />);

    const drawer = screen
      .getByRole("navigation", { hidden: true })
      .closest("aside");
    expect(drawer).toHaveClass("drawer-closed", "-translate-x-full");
  });

  it("applies collapsed classes when drawer is collapsed", () => {
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: true,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    renderWithProviders(<Drawer items={mockItems} />);

    const drawer = screen.getByRole("navigation").closest("aside");
    expect(drawer).toHaveClass("drawer-collapsed");
  });

  it("shows overlay on mobile when drawer is open", () => {
    vi.mocked(useIsMobile).mockReturnValue(true);
    vi.mocked(useIsMounted).mockReturnValue(true);

    renderWithProviders(<Drawer items={mockItems} />);

    expect(screen.getByTestId("overlay")).toBeInTheDocument();
  });

  it("does not show overlay on desktop", () => {
    vi.mocked(useIsMobile).mockReturnValue(false);

    renderWithProviders(<Drawer items={mockItems} />);

    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
  });

  it("closes drawer on overlay click", () => {
    const mockToggleOpen = vi.fn();
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: false,
      isOpen: true,
      toggleOpen: mockToggleOpen,
      toggleCollapsed: vi.fn(),
    });
    vi.mocked(useIsMobile).mockReturnValue(true);

    renderWithProviders(<Drawer items={mockItems} />);

    fireEvent.click(screen.getByTestId("overlay"));
    expect(mockToggleOpen).toHaveBeenCalled();
  });

  it("closes drawer on Escape key press", () => {
    const mockToggleOpen = vi.fn();
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: false,
      isOpen: true,
      toggleOpen: mockToggleOpen,
      toggleCollapsed: vi.fn(),
    });
    vi.mocked(useIsMobile).mockReturnValue(true);

    renderWithProviders(<Drawer items={mockItems} />);

    fireEvent.keyDown(screen.getByTestId("overlay"), { key: "Escape" });
    expect(mockToggleOpen).toHaveBeenCalled();
  });

  it("sets aria-current='page' for active links", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/users" } as ReturnType<
      typeof useLocation
    >);

    renderWithProviders(<Drawer items={mockItems} />);

    const usersLink = screen.getByText("Users").closest("a");
    expect(usersLink).toHaveAttribute("aria-current", "page");
  });

  it("applies active styles for current page", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/users" } as ReturnType<
      typeof useLocation
    >);

    renderWithProviders(<Drawer items={mockItems} />);

    const usersLink = screen.getByText("Users").closest("a");
    expect(usersLink).toHaveClass(
      "text-primary-600",
      "bg-gray-100",
      "font-medium",
    );
  });

  it("applies correct padding for nested items", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const managementButton = screen.getByText("Management").closest("button");
    fireEvent.click(managementButton!);

    const overviewLink = screen.getByText("Overview").closest("a");
    expect(overviewLink).toHaveClass("pl-7");
  });

  it("centers items when collapsed", () => {
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: true,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    renderWithProviders(<Drawer items={mockItems} />);

    const usersLink = screen.getByTestId("users-icon").closest("a");
    expect(usersLink).toHaveClass("justify-center");
  });

  it("hides labels when collapsed at level 0", () => {
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: true,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    renderWithProviders(<Drawer items={mockItems} />);

    const userButton = screen.getByTestId("users-icon").closest("a");
    expect(userButton?.textContent).not.toContain("Users");
  });

  it("shows popover for collapsed expandable items on hover", () => {
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: true,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    renderWithProviders(<Drawer items={mockItems} />);

    const managementItem = screen.getByTestId("management-icon").closest("li");
    fireEvent.mouseEnter(managementItem!);

    expect(screen.getByTestId("popover")).toBeInTheDocument();
    expect(screen.getByText("Management")).toBeInTheDocument();
  });

  it("hides popover when mouse leaves collapsed item", () => {
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: true,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    renderWithProviders(<Drawer items={mockItems} />);

    const managementItem = screen.getByTestId("management-icon").closest("li");
    fireEvent.mouseEnter(managementItem!);
    fireEvent.mouseLeave(managementItem!);

    expect(screen.queryByTestId("popover")).not.toBeInTheDocument();
  });

  it("closes drawer on mobile when link is clicked", () => {
    const mockToggleOpen = vi.fn();
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: false,
      isOpen: true,
      toggleOpen: mockToggleOpen,
      toggleCollapsed: vi.fn(),
    });
    vi.mocked(useIsMobile).mockReturnValue(true);

    renderWithProviders(<Drawer items={mockItems} />);

    const usersLink = screen.getByText("Users").closest("a");
    fireEvent.click(usersLink!);

    expect(mockToggleOpen).toHaveBeenCalled();
  });

  it("does not toggle submenu when collapsed", () => {
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: true,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    renderWithProviders(<Drawer items={mockItems} />);

    const managementButton = screen
      .getByTestId("management-icon")
      .closest("button");
    fireEvent.click(managementButton!);

    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
  });

  it("rotates chevron icon when expanded", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const managementButton = screen.getByText("Management").closest("button");
    fireEvent.click(managementButton!);

    const chevronIcon = document.querySelector(".lucide-chevron-right");
    expect(chevronIcon).toHaveClass("rotate-90");
  });

  it("does not show chevron when collapsed", () => {
    vi.mocked(React.use).mockReturnValue({
      isCollapsed: true,
      isOpen: true,
      toggleOpen: vi.fn(),
      toggleCollapsed: vi.fn(),
    });

    renderWithProviders(<Drawer items={mockItems} />);

    const managementButton = screen
      .getByTestId("management-icon")
      .closest("button");

    const chevron = managementButton?.querySelector(".lucide-chevron-right");
    expect(chevron).not.toBeInTheDocument();
  });

  it("sets correct ARIA attributes for expandable items", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const managementButton = screen.getByText("Management").closest("button");
    expect(managementButton).toHaveAttribute("aria-haspopup", "true");
    expect(managementButton).toHaveAttribute("aria-expanded", "false");
    expect(managementButton).toHaveAttribute(
      "aria-controls",
      "submenu-management",
    );

    fireEvent.click(managementButton!);
    expect(managementButton).toHaveAttribute("aria-expanded", "true");
  });

  it("generates correct submenu id from label", () => {
    renderWithProviders(<Drawer items={mockItems} />);

    const managementButton = screen.getByText("Management").closest("button");
    fireEvent.click(managementButton!);

    const submenu = screen.getByRole("menu");
    expect(submenu).toHaveAttribute("id", "submenu-management");
  });

  it("applies custom className to drawer", () => {
    renderWithProviders(
      <Drawer items={mockItems} className="custom-drawer-class" />,
    );

    const drawer = screen.getByRole("navigation").closest("aside");
    expect(drawer).toHaveClass("custom-drawer-class");
  });

  it("forwards additional props to aside element", () => {
    renderWithProviders(
      <Drawer items={mockItems} data-testid="custom-drawer" />,
    );

    expect(screen.getByTestId("custom-drawer")).toBeInTheDocument();
  });

  it("renders nested items with correct level indentation", () => {
    const nestedItems = [
      {
        label: "Parent",
        children: [
          {
            label: "Child Level 1",
            children: [
              {
                href: "/deep-link",
                label: "Child Level 2",
              },
            ],
          },
        ],
      },
    ];

    renderWithProviders(<Drawer items={nestedItems} />);

    const parentButton = screen.getByText("Parent").closest("button");
    fireEvent.click(parentButton!);

    const childButton = screen.getByText("Child Level 1").closest("button");
    expect(childButton).toHaveClass("pl-7");

    fireEvent.click(childButton!);

    const deepLink = screen.getByText("Child Level 2").closest("a");
    expect(deepLink).toHaveClass("pl-7");
  });

  it("handles items with both href and children correctly", () => {
    const itemsWithBothHrefAndChildren = [
      {
        href: "/parent-with-link",
        label: "Parent with Link",
        icon: <span data-testid="parent-icon">📁</span>,
        children: [
          {
            href: "/parent-with-link/child",
            label: "Child Item",
          },
        ],
      },
    ];

    renderWithProviders(<Drawer items={itemsWithBothHrefAndChildren} />);

    const parentButton = screen.getByText("Parent with Link").closest("button");
    expect(parentButton).toBeInTheDocument();

    const parentLink = screen.getByText("Parent with Link").closest("a");
    expect(parentLink).toBeNull();

    fireEvent.click(parentButton!);

    const childLink = screen.getByText("Child Item").closest("a");
    expect(childLink).toHaveAttribute("href", "/parent-with-link/child");
  });

  it("does not set aria-current when item has children even if href matches", () => {
    vi.mocked(useLocation).mockReturnValue({
      pathname: "/parent-with-link",
    } as ReturnType<typeof useLocation>);

    const itemsWithBothHrefAndChildren = [
      {
        href: "/parent-with-link",
        label: "Parent with Link",
        children: [
          {
            href: "/parent-with-link/child",
            label: "Child Item",
          },
        ],
      },
    ];

    renderWithProviders(<Drawer items={itemsWithBothHrefAndChildren} />);

    const parentButton = screen.getByText("Parent with Link").closest("button");
    expect(parentButton).not.toHaveAttribute("aria-current");
  });
});
