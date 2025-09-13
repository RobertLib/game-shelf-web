import { renderWithProviders, screen } from "../../test-utils";
import Breadcrumbs from "../../../components/ui/breadcrumbs";

describe("Breadcrumbs Component", () => {
  it("renders correctly with required props", () => {
    renderWithProviders(<Breadcrumbs items={[{ label: "Položka 1", href: "/item1" }]} />);

    const homeLinkElement = screen.getByRole("link", { name: "Home" });
    expect(homeLinkElement).toBeInTheDocument();

    const homeTextLink = screen.getByRole("link", { name: "Domů" });
    expect(homeTextLink).toBeInTheDocument();

    const item1Link = screen.getByText("Položka 1");
    expect(item1Link).toBeInTheDocument();
  });

  it("renders multiple items correctly", () => {
    renderWithProviders(
      <Breadcrumbs
        items={[
          { label: "Kategorie", href: "/category" },
          { label: "Podkategorie", href: "/subcategory" },
          { label: "Detail" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Domů" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kategorie" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Podkategorie" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Detail")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Detail" }),
    ).not.toBeInTheDocument();
  });

  it("shows fallback text for null or undefined labels", () => {
    renderWithProviders(
      <Breadcrumbs
        items={[{ label: null, href: "/null-item" }, { label: undefined }]}
      />,
    );

    const placeholderLinks = screen.getAllByText("...");
    expect(placeholderLinks.length).toBe(2);
  });

  it("renders the last item without a link", () => {
    renderWithProviders(
      <Breadcrumbs
        items={[{ label: "První", href: "/first" }, { label: "Poslední" }]}
      />,
    );

    expect(screen.getByRole("link", { name: "První" })).toBeInTheDocument();

    const lastItem = screen.getByText("Poslední");
    expect(lastItem.tagName.toLowerCase()).toBe("span");
    expect(lastItem).toHaveClass("font-semibold");
    expect(lastItem).toHaveClass("text-gray-500");
  });

  it("passes additional props to nav element", () => {
    renderWithProviders(
      <Breadcrumbs
        items={[{ label: "Test" }]}
        aria-label="Navigace"
        data-testid="breadcrumbs-nav"
      />,
    );

    const navElement = screen.getByTestId("breadcrumbs-nav");
    expect(navElement).toBeInTheDocument();
    expect(navElement).toHaveAttribute("aria-label", "Navigace");
  });

  it("uses fallback href for items without href", () => {
    renderWithProviders(<Breadcrumbs items={[{ label: "Bez odkazu" }]} />);

    const linkElement = screen.getByText("Bez odkazu");
    expect(linkElement).toBeInTheDocument();
  });
});
