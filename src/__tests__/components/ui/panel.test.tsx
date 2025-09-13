import { renderWithProviders, screen } from "../../test-utils";
import Panel from "../../../components/ui/panel";

describe("Panel Component", () => {
  it("renders correctly with children", () => {
    renderWithProviders(
      <Panel data-testid="panel">
        <p>Panel content</p>
      </Panel>,
    );

    const panel = screen.getByTestId("panel");
    expect(panel).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    renderWithProviders(<Panel data-testid="panel">Content</Panel>);

    const panel = screen.getByTestId("panel");
    expect(panel).toHaveClass("border-surface/30");
    expect(panel).toHaveClass("bg-surface");
    expect(panel).toHaveClass("rounded-md");
    expect(panel).toHaveClass("border");
    expect(panel).toHaveClass("p-6");
    expect(panel).toHaveClass("shadow-sm");
  });

  it("combines custom className with default classes", () => {
    renderWithProviders(
      <Panel data-testid="panel" className="custom-class">
        Content
      </Panel>,
    );

    const panel = screen.getByTestId("panel");
    expect(panel).toHaveClass("custom-class");
    expect(panel).toHaveClass("bg-surface");
  });

  it("forwards additional props to div element", () => {
    renderWithProviders(
      <Panel data-testid="panel-test" aria-label="Panel component">
        Content
      </Panel>,
    );

    const panel = screen.getByTestId("panel-test");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute("aria-label", "Panel component");
  });

  describe("Rounded variants", () => {
    it("applies rounded-sm class", () => {
      renderWithProviders(
        <Panel rounded="sm" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-sm");
    });

    it("applies rounded-md class (default)", () => {
      renderWithProviders(
        <Panel rounded="md" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-md");
    });

    it("applies rounded-lg class", () => {
      renderWithProviders(
        <Panel rounded="lg" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-lg");
    });

    it("applies rounded-xl class", () => {
      renderWithProviders(
        <Panel rounded="xl" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-xl");
    });

    it("applies rounded-2xl class", () => {
      renderWithProviders(
        <Panel rounded="2xl" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-2xl");
    });

    it("applies rounded-3xl class", () => {
      renderWithProviders(
        <Panel rounded="3xl" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-3xl");
    });

    it("applies rounded-full class", () => {
      renderWithProviders(
        <Panel rounded="full" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-full");
    });

    it("applies no rounded class when rounded is none", () => {
      renderWithProviders(
        <Panel rounded="none" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel.className).not.toMatch(/rounded-/);
    });
  });

  describe("Shadow variants", () => {
    it("applies shadow-sm class", () => {
      renderWithProviders(
        <Panel shadow="sm" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("shadow-sm");
    });

    it("applies shadow-md class (default)", () => {
      renderWithProviders(
        <Panel shadow="md" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("shadow-md");
    });

    it("applies shadow-lg class", () => {
      renderWithProviders(
        <Panel shadow="lg" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("shadow-lg");
    });

    it("applies shadow-xl class", () => {
      renderWithProviders(
        <Panel shadow="xl" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("shadow-xl");
    });

    it("applies shadow-2xl class", () => {
      renderWithProviders(
        <Panel shadow="2xl" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("shadow-2xl");
    });

    it("applies neutral border when border is neutral and no shadow", () => {
      renderWithProviders(
        <Panel shadow="none" border="neutral" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel.className).not.toMatch(/shadow-/);
      expect(panel.className).toMatch(/border-neutral-200/);
    });
  });

  describe("Combined variants", () => {
    it("applies both rounded and shadow variants correctly", () => {
      renderWithProviders(
        <Panel rounded="lg" shadow="xl" data-testid="panel">
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-lg");
      expect(panel).toHaveClass("shadow-xl");
    });

    it("works with custom className and variants", () => {
      renderWithProviders(
        <Panel
          rounded="2xl"
          shadow="lg"
          className="custom-bg"
          data-testid="panel"
        >
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveClass("rounded-2xl");
      expect(panel).toHaveClass("shadow-lg");
      expect(panel).toHaveClass("custom-bg");
      expect(panel).toHaveClass("bg-surface");
    });
  });

  describe("Layout and spacing", () => {
    it("renders children directly in panel", () => {
      renderWithProviders(
        <Panel data-testid="panel">
          <span data-testid="child-content">Child content</span>
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      const childContent = screen.getByTestId("child-content");

      expect(panel).toContainElement(childContent);
    });
  });

  describe("Accessibility", () => {
    it("supports custom aria attributes", () => {
      renderWithProviders(
        <Panel
          aria-labelledby="external-label"
          role="region"
          data-testid="panel"
        >
          Content
        </Panel>,
      );

      const panel = screen.getByTestId("panel");
      expect(panel).toHaveAttribute("aria-labelledby", "external-label");
      expect(panel).toHaveAttribute("role", "region");
    });
  });
});
