import {
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import IconButton from "../../../components/ui/icon-button";

describe("IconButton Component", () => {
  it("renders correctly with children", () => {
    renderWithProviders(<IconButton>Test Icon</IconButton>);
    expect(screen.getByText("Test Icon")).toBeInTheDocument();
  });

  it("applies correct variant styles", () => {
    renderWithProviders(<IconButton data-testid="button">Button</IconButton>);
    let button = screen.getByTestId("button");
    expect(button).not.toHaveClass("text-primary-500");
    expect(button).not.toHaveClass("text-secondary-500");
    expect(button).not.toHaveClass("text-danger-500");

    rerenderWithProviders(
      <IconButton data-testid="button" variant="primary">
        Button
      </IconButton>,
    );
    button = screen.getByTestId("button");
    expect(button).toHaveClass("text-primary-500");

    rerenderWithProviders(
      <IconButton data-testid="button" variant="secondary">
        Button
      </IconButton>,
    );
    button = screen.getByTestId("button");
    expect(button).toHaveClass("text-secondary-500");

    rerenderWithProviders(
      <IconButton data-testid="button" variant="danger">
        Button
      </IconButton>,
    );
    button = screen.getByTestId("button");
    expect(button).toHaveClass("text-danger-500");
  });

  it("applies disabled styles when disabled or loading", () => {
    renderWithProviders(
      <IconButton data-testid="button" disabled>
        Button
      </IconButton>,
    );
    let button = screen.getByTestId("button");
    expect(button).toHaveClass("opacity-50");
    expect(button).toHaveClass("cursor-not-allowed");
    expect(button).toBeDisabled();

    rerenderWithProviders(
      <IconButton data-testid="button" loading>
        Button
      </IconButton>,
    );
    button = screen.getByTestId("button");
    expect(button).toHaveClass("opacity-50");
    expect(button).toHaveClass("cursor-not-allowed");
    expect(button).toBeDisabled();
  });

  it("displays loading spinner when loading is true", () => {
    renderWithProviders(<IconButton loading>Button</IconButton>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Button")).not.toBeInTheDocument();

    const svgElement = document.querySelector("svg");
    expect(svgElement).toHaveClass("animate-spin");
  });

  it("sets button type correctly", () => {
    renderWithProviders(<IconButton data-testid="button">Button</IconButton>);
    let button = screen.getByTestId("button");
    expect(button).toHaveAttribute("type", "button");

    rerenderWithProviders(
      <IconButton data-testid="button" type="submit">
        Button
      </IconButton>,
    );
    button = screen.getByTestId("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("applies custom className along with default styles", () => {
    renderWithProviders(
      <IconButton data-testid="button" className="custom-class">
        Button
      </IconButton>,
    );
    const button = screen.getByTestId("button");

    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("rounded-md");
    expect(button).toHaveClass("transition-colors");
  });

  it("handles click events correctly", () => {
    const handleClick = vi.fn();
    renderWithProviders(<IconButton onClick={handleClick}>Button</IconButton>);

    fireEvent.click(screen.getByText("Button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled or loading", () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <IconButton onClick={handleClick} disabled>
        Button
      </IconButton>,
    );

    fireEvent.click(screen.getByText("Button"));
    expect(handleClick).not.toHaveBeenCalled();

    rerenderWithProviders(
      <IconButton onClick={handleClick} loading>
        Button
      </IconButton>,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("sets correct aria attributes", () => {
    renderWithProviders(<IconButton data-testid="button">Button</IconButton>);
    let button = screen.getByTestId("button");

    expect(button).toHaveAttribute("aria-busy", "false");
    expect(button).not.toHaveAttribute("aria-disabled", "true");

    rerenderWithProviders(
      <IconButton data-testid="button" loading>
        Button
      </IconButton>,
    );
    button = screen.getByTestId("button");
    expect(button).toHaveAttribute("aria-busy", "true");

    rerenderWithProviders(
      <IconButton data-testid="button" disabled>
        Button
      </IconButton>,
    );
    button = screen.getByTestId("button");
    expect(button).toHaveAttribute("aria-disabled", "true");
  });
});
