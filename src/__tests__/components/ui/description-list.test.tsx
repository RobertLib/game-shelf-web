import { renderWithProviders, screen } from "../../test-utils";
import DescriptionList from "../../../components/ui/description-list";

describe("DescriptionList Component", () => {
  const mockItems = [
    { term: "Name", desc: "John Doe" },
    { term: "E-mail", desc: "john@example.com" },
    { term: "Phone", desc: null },
    { term: "Address", desc: undefined },
  ];

  it("renders terms and descriptions correctly", () => {
    renderWithProviders(<DescriptionList items={mockItems} />);

    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("E-mail:")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("renders placeholders for null/undefined descriptions", () => {
    renderWithProviders(<DescriptionList items={mockItems} loading />);

    const placeholders = document.querySelectorAll(".animate-pulse");
    expect(placeholders.length).toBe(4);

    placeholders.forEach((placeholder) => {
      expect(placeholder).toHaveClass(
        "h-4",
        "animate-pulse",
        "rounded",
        "bg-gray-200",
      );
    });
  });

  it("applies different placeholder widths based on index", () => {
    renderWithProviders(<DescriptionList items={mockItems} loading />);

    const placeholders = document.querySelectorAll(".animate-pulse");
    expect(placeholders[0]).toHaveClass("w-34");
    expect(placeholders[1]).toHaveClass("w-30");
  });

  it("applies custom className", () => {
    renderWithProviders(
      <DescriptionList items={mockItems} className="custom-class" />,
    );

    const dlElement = document.querySelector("dl");
    expect(dlElement).toHaveClass("custom-class");
    expect(dlElement).toHaveClass("space-y-1", "md:grid");
  });

  it("passes additional props to dl element", () => {
    renderWithProviders(
      <DescriptionList
        items={mockItems}
        data-testid="test-list"
        aria-label="Description list"
      />,
    );

    const dlElement = screen.getByTestId("test-list");
    expect(dlElement).toHaveAttribute("aria-label", "Description list");
  });

  it("applies custom term width when provided", () => {
    renderWithProviders(
      <DescriptionList items={mockItems} termWidth="200px" />,
    );

    const dlElement = document.querySelector("dl");
    expect(dlElement).toHaveClass(
      "md:[grid-template-columns:var(--term-width)_1fr]",
    );
    expect(dlElement).toHaveStyle({ "--term-width": "200px" });
  });

  it("uses auto grid columns when termWidth is not provided", () => {
    renderWithProviders(<DescriptionList items={mockItems} />);

    const dlElement = document.querySelector("dl");
    expect(dlElement).toHaveClass("md:grid-cols-[auto_1fr]");
    expect(dlElement).not.toHaveClass(
      "md:[grid-template-columns:var(--term-width)_1fr]",
    );
    expect(dlElement).not.toHaveStyle({ "--term-width": expect.anything() });
  });
});
