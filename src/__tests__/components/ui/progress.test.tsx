import { renderWithProviders, screen } from "../../test-utils";
import Progress from "../../../components/ui/progress";

describe("Progress Component", () => {
  it("renders correctly with default props", () => {
    renderWithProviders(<Progress value={50} />);
    const progressContainer = screen.getByRole("progressbar");
    expect(progressContainer).toBeInTheDocument();
  });

  it("renders with custom value", () => {
    renderWithProviders(<Progress value={75} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "75");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders with custom max value", () => {
    renderWithProviders(<Progress value={25} max={50} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "25");
    expect(progressBar).toHaveAttribute("aria-valuemax", "50");
  });

  it("displays label when provided", () => {
    renderWithProviders(<Progress value={60} label="Loading files" />);
    expect(screen.getByText("Loading files")).toBeInTheDocument();
  });

  it("displays description when provided", () => {
    renderWithProviders(<Progress value={40} description="Please wait..." />);
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("displays both label and description", () => {
    renderWithProviders(
      <Progress value={30} label="Progress" description="Almost done" />,
    );
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Almost done")).toBeInTheDocument();
  });

  it("shows percentage when showPercentage is true", () => {
    renderWithProviders(<Progress value={75} showPercentage />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("calculates percentage correctly", () => {
    renderWithProviders(<Progress value={25} max={50} showPercentage />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("handles values over maximum", () => {
    renderWithProviders(<Progress value={150} max={100} showPercentage />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("handles negative values", () => {
    renderWithProviders(<Progress value={-10} showPercentage />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithProviders(
      <Progress value={50} className="custom-progress" />,
    );
    expect(container.firstChild).toHaveClass("custom-progress");
  });

  it("applies small size class", () => {
    const { container } = renderWithProviders(
      <Progress value={50} size="sm" />,
    );
    const progressTrack = container.querySelector('[class*="h-1"]');
    expect(progressTrack).toBeInTheDocument();
  });

  it("applies medium size class (default)", () => {
    const { container } = renderWithProviders(<Progress value={50} />);
    const progressTrack = container.querySelector('[class*="h-2"]');
    expect(progressTrack).toBeInTheDocument();
  });

  it("applies large size class", () => {
    const { container } = renderWithProviders(
      <Progress value={50} size="lg" />,
    );
    const progressTrack = container.querySelector('[class*="h-3"]');
    expect(progressTrack).toBeInTheDocument();
  });

  it("applies primary variant class (default)", () => {
    const { container } = renderWithProviders(<Progress value={50} />);
    const progressFill = container.querySelector('[class*="bg-primary-600"]');
    expect(progressFill).toBeInTheDocument();
  });

  it("applies secondary variant class", () => {
    const { container } = renderWithProviders(
      <Progress value={50} variant="secondary" />,
    );
    const progressFill = container.querySelector('[class*="bg-secondary-600"]');
    expect(progressFill).toBeInTheDocument();
  });

  it("applies success variant class", () => {
    const { container } = renderWithProviders(
      <Progress value={50} variant="success" />,
    );
    const progressFill = container.querySelector('[class*="bg-success-600"]');
    expect(progressFill).toBeInTheDocument();
  });

  it("applies warning variant class", () => {
    const { container } = renderWithProviders(
      <Progress value={50} variant="warning" />,
    );
    const progressFill = container.querySelector('[class*="bg-warning-600"]');
    expect(progressFill).toBeInTheDocument();
  });

  it("applies danger variant class", () => {
    const { container } = renderWithProviders(
      <Progress value={50} variant="danger" />,
    );
    const progressFill = container.querySelector('[class*="bg-danger-600"]');
    expect(progressFill).toBeInTheDocument();
  });

  it("sets correct width style for progress fill", () => {
    const { container } = renderWithProviders(<Progress value={75} />);
    const progressFill = container.querySelector('[style*="width"]');
    expect(progressFill).toHaveStyle({ width: "75%" });
  });

  it("does not render label/description section when none are provided", () => {
    renderWithProviders(<Progress value={50} />);
    const textElements = screen.queryByText(/Loading|Progress|%/);
    expect(textElements).not.toBeInTheDocument();
  });

  it("renders properly with zero value", () => {
    renderWithProviders(<Progress value={0} showPercentage />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "0");
  });

  it("renders properly with maximum value", () => {
    renderWithProviders(<Progress value={100} showPercentage />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });
});
