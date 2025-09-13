import {
  fireEvent,
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../../test-utils";
import Header from "../../../components/ui/header";

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with title", () => {
    renderWithProviders(<Header title="Test Header" />);
    expect(screen.getByText("Test Header")).toBeInTheDocument();
    expect(screen.getByText("Test Header").tagName.toLowerCase()).toBe("h1");
  });

  it("displays fallback text when title is null or undefined", () => {
    renderWithProviders(<Header title={null} />);
    expect(screen.getByText("...")).toBeInTheDocument();

    rerenderWithProviders(<Header title={undefined} />);
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("renders back button when back prop is true", () => {
    renderWithProviders(<Header title="Test Header" back />);
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeInTheDocument();
  });

  it("doesn't render back button when back prop is not provided", () => {
    renderWithProviders(<Header title="Test Header" />);
    expect(
      screen.queryByRole("button", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("calls navigate(-1) when back button is clicked", () => {
    renderWithProviders(<Header title="Test Header" back />);
    const backButton = screen.getByRole("button", { name: "Back" });

    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("renders actions when provided", () => {
    renderWithProviders(
      <Header
        title="Test Header"
        actions={<button data-testid="action-button">Action</button>}
      />,
    );

    expect(screen.getByTestId("action-button")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithProviders(
      <Header title="Test Header" className="custom-class" />,
    );

    const headerElement = screen.getByText("Test Header").closest("div");
    expect(headerElement?.parentElement).toHaveClass("custom-class");
    expect(headerElement?.parentElement).toHaveClass("flex");
    expect(headerElement?.parentElement).toHaveClass("items-center");
  });

  it("passes additional props to div element", () => {
    renderWithProviders(
      <Header
        title="Test Header"
        data-testid="header-element"
        aria-label="Page header"
      />,
    );

    const headerElement = screen.getByTestId("header-element");
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveAttribute("aria-label", "Page header");
  });
});
