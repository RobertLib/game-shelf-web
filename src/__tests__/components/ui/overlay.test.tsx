import { createPortal } from "react-dom";
import { renderWithProviders, screen } from "../../test-utils";
import Overlay from "../../../components/ui/overlay";

vi.mock("react-dom", () => ({
  createPortal: vi.fn((element) => element),
}));

describe("Overlay Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    renderWithProviders(<Overlay data-testid="overlay" />);

    const overlay = screen.getByTestId("overlay");
    expect(overlay).toBeInTheDocument();
  });

  it("applies default classes", () => {
    renderWithProviders(<Overlay data-testid="overlay" />);

    const overlay = screen.getByTestId("overlay");
    expect(overlay).toHaveClass("animate-fade-in");
    expect(overlay).toHaveClass("fixed");
    expect(overlay).toHaveClass("inset-0");
    expect(overlay).toHaveClass("z-30");
    expect(overlay).toHaveClass("bg-black/50");
  });

  it("combines custom className with default classes", () => {
    renderWithProviders(<Overlay className="custom-class" data-testid="overlay" />);

    const overlay = screen.getByTestId("overlay");
    expect(overlay).toHaveClass("custom-class");
    expect(overlay).toHaveClass("animate-fade-in");
  });

  it("forwards additional props to the div element", () => {
    renderWithProviders(<Overlay data-testid="overlay" aria-label="Modal overlay" />);

    const overlay = screen.getByTestId("overlay");
    expect(overlay).toHaveAttribute("aria-label", "Modal overlay");
  });

  it("uses createPortal to render into document.body", () => {
    renderWithProviders(<Overlay />);

    expect(createPortal).toHaveBeenCalledTimes(1);
    expect(createPortal).toHaveBeenCalledWith(
      expect.any(Object),
      document.body,
    );
  });
});
