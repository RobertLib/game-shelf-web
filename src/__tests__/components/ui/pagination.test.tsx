import { fireEvent, renderWithProviders, screen } from "../../test-utils";
import Pagination from "../../../components/ui/pagination";

describe("Pagination Component", () => {
  it("renders correctly with required props", () => {
    const onChange = vi.fn();
    renderWithProviders(<Pagination currentPage={1} onChange={onChange} />);

    expect(screen.getByLabelText("Pagination")).toBeInTheDocument();
    expect(screen.getByText("1 - 1 / 1")).toBeInTheDocument();
  });

  it("displays correct item range for different pages", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Pagination currentPage={2} onChange={onChange} total={30} first={10} />,
    );

    expect(screen.getByText("11 - 20 / 30")).toBeInTheDocument();
  });

  it("displays correct item range for first page", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Pagination currentPage={1} onChange={onChange} total={25} first={10} />,
    );

    expect(screen.getByText("1 - 10 / 25")).toBeInTheDocument();
  });

  it("displays correct item range for last page with fewer items", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Pagination currentPage={3} onChange={onChange} total={25} first={10} />,
    );

    expect(screen.getByText("21 - 25 / 25")).toBeInTheDocument();
  });

  it("displays fallback when total or first is undefined", () => {
    const onChange = vi.fn();
    renderWithProviders(<Pagination currentPage={5} onChange={onChange} />);

    expect(screen.getByText("1 - 1 / 1")).toBeInTheDocument();
  });

  it("disables first and previous buttons on first page", () => {
    const onChange = vi.fn();
    const pageInfo = {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: null,
      endCursor: "cursor1",
    };
    renderWithProviders(
      <Pagination
        currentPage={1}
        onChange={onChange}
        total={30}
        first={10}
        pageInfo={pageInfo}
      />,
    );

    expect(screen.getByLabelText("Go to first page")).toBeDisabled();
    expect(screen.getByLabelText("Go to previous page")).toBeDisabled();
    expect(screen.getByLabelText("Go to next page")).not.toBeDisabled();
  });

  it("disables next button on last page", () => {
    const onChange = vi.fn();
    const pageInfo = {
      hasPreviousPage: true,
      hasNextPage: false,
      startCursor: "cursor1",
      endCursor: null,
    };
    renderWithProviders(
      <Pagination
        currentPage={3}
        onChange={onChange}
        total={30}
        first={10}
        pageInfo={pageInfo}
      />,
    );

    expect(screen.getByLabelText("Go to first page")).not.toBeDisabled();
    expect(screen.getByLabelText("Go to previous page")).not.toBeDisabled();
    expect(screen.getByLabelText("Go to next page")).toBeDisabled();
  });

  it("disables next button when pageInfo indicates no next page", () => {
    const onChange = vi.fn();
    const pageInfo = {
      hasPreviousPage: false,
      hasNextPage: false,
      startCursor: null,
      endCursor: null,
    };
    renderWithProviders(
      <Pagination currentPage={1} onChange={onChange} pageInfo={pageInfo} />,
    );

    expect(screen.getByLabelText("Go to next page")).toBeDisabled();
  });

  it("calls onChange with correct direction when buttons are clicked", () => {
    const onChange = vi.fn();
    const pageInfo = {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: "cursor1",
      endCursor: "cursor2",
    };
    renderWithProviders(
      <Pagination
        currentPage={2}
        onChange={onChange}
        total={30}
        first={10}
        pageInfo={pageInfo}
      />,
    );

    fireEvent.click(screen.getByLabelText("Go to first page"));
    expect(onChange).toHaveBeenCalledWith("first");

    fireEvent.click(screen.getByLabelText("Go to previous page"));
    expect(onChange).toHaveBeenCalledWith("prev", "cursor1");

    fireEvent.click(screen.getByLabelText("Go to next page"));
    expect(onChange).toHaveBeenCalledWith("next", "cursor2");
  });

  it("applies custom className", () => {
    const onChange = vi.fn();
    const { container } = renderWithProviders(
      <Pagination
        currentPage={1}
        onChange={onChange}
        className="custom-class"
      />,
    );

    const ul = container.querySelector("ul");
    expect(ul).toHaveClass("custom-class");
    expect(ul).toHaveClass("flex");
    expect(ul).toHaveClass("items-center");
    expect(ul).toHaveClass("gap-1.5");
  });

  it("passes additional props to ul element", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <Pagination
        currentPage={1}
        onChange={onChange}
        data-testid="pagination-test"
        aria-label="Custom pagination"
      />,
    );

    const ul = screen.getByTestId("pagination-test");
    expect(ul).toBeInTheDocument();
    expect(ul).toHaveAttribute("aria-label", "Custom pagination");
  });
});
