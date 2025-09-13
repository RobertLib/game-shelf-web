import {
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import Alert from "../../../components/ui/alert";

describe("Alert Component", () => {
  it("renders correctly with default props", () => {
    renderWithProviders(<Alert>Test alert</Alert>);

    const alert = screen.getByRole("status");
    expect(alert).toHaveClass("rounded-lg");
    expect(alert).toHaveClass("bg-gradient-to-r");
    expect(alert).toHaveClass("from-primary-50");
    expect(alert).toHaveAttribute("role", "status");
    expect(alert).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Test alert")).toBeInTheDocument();

    const icon = screen.getByRole("status").querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("does not render when children are empty", () => {
    renderWithProviders(<Alert></Alert>);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("applies correct gradient styles based on type", () => {
    renderWithProviders(<Alert type="success">Success alert</Alert>);
    let alert = screen.getByRole("status");
    expect(alert).toHaveClass("from-success-50");
    expect(alert).toHaveClass("to-success-50");

    rerenderWithProviders(<Alert type="danger">Danger alert</Alert>);
    alert = screen.getByRole("alert");
    expect(alert).toHaveClass("from-danger-50");
    expect(alert).toHaveClass("to-danger-50");

    rerenderWithProviders(<Alert type="warning">Warning alert</Alert>);
    alert = screen.getByRole("alert");
    expect(alert).toHaveClass("from-warning-50");
    expect(alert).toHaveClass("to-warning-50");

    rerenderWithProviders(<Alert type="info">Info alert</Alert>);
    alert = screen.getByRole("status");
    expect(alert).toHaveClass("from-primary-50");
    expect(alert).toHaveClass("to-primary-50");
  });

  it("renders with title when provided", () => {
    renderWithProviders(
      <Alert title="Alert Title" type="info">
        Alert content
      </Alert>,
    );

    expect(screen.getByText("Alert Title")).toBeInTheDocument();
    expect(screen.getByText("Alert content")).toBeInTheDocument();

    const titleElement = screen.getByText("Alert Title");
    expect(titleElement.tagName).toBe("H3");
  });

  it("renders without title when not provided", () => {
    renderWithProviders(<Alert type="info">Alert content</Alert>);

    expect(screen.getByText("Alert content")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithProviders(<Alert className="custom-class">Test alert</Alert>);
    const alert = screen.getByRole("status");
    expect(alert).toHaveClass("custom-class");
  });

  it("sets the correct role based on type", () => {
    renderWithProviders(<Alert>Info alert</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerenderWithProviders(<Alert type="success">Success alert</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerenderWithProviders(<Alert type="danger">Danger alert</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerenderWithProviders(<Alert type="warning">Warning alert</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("sets the correct aria-live attribute based on type", () => {
    renderWithProviders(<Alert>Info alert</Alert>);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");

    rerenderWithProviders(<Alert type="danger">Danger alert</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");

    rerenderWithProviders(<Alert type="warning">Warning alert</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "polite");

    rerenderWithProviders(<Alert type="success">Success alert</Alert>);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("renders correct icon for each type", () => {
    renderWithProviders(<Alert type="info">Info alert</Alert>);
    let icon = screen.getByRole("status").querySelector("svg");
    expect(icon).toBeInTheDocument();

    rerenderWithProviders(<Alert type="success">Success alert</Alert>);
    icon = screen.getByRole("status").querySelector("svg");
    expect(icon).toBeInTheDocument();

    rerenderWithProviders(<Alert type="danger">Danger alert</Alert>);
    icon = screen.getByRole("alert").querySelector("svg");
    expect(icon).toBeInTheDocument();

    rerenderWithProviders(<Alert type="warning">Warning alert</Alert>);
    icon = screen.getByRole("alert").querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("applies correct layout structure", () => {
    renderWithProviders(
      <Alert title="Test Title" type="info">
        Test content
      </Alert>,
    );

    const alert = screen.getByRole("status");

    const flexContainer = alert.querySelector(".flex.items-start.space-x-3");
    expect(flexContainer).toBeInTheDocument();

    const iconContainer = alert.querySelector(".flex-shrink-0");
    expect(iconContainer).toBeInTheDocument();
  });

  it("passes additional props to div element", () => {
    renderWithProviders(<Alert data-testid="test-alert">Test alert</Alert>);
    expect(screen.getByTestId("test-alert")).toBeInTheDocument();
  });
});
