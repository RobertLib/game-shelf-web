import { fireEvent, renderWithProviders, screen } from "../../../test-utils";
import { TableFooter } from "../../../../components/ui/data-table/table-footer";

const mockSetSearchParams = vi.fn();
vi.mock("react-router", () => ({
  useSearchParams: () => [new URLSearchParams(), mockSetSearchParams],
}));

describe("TableFooter Component", () => {
  const defaultProps = {
    first: 10,
    currentPage: 2,
    total: 50,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with required props", () => {
    renderWithProviders(<TableFooter {...defaultProps} />);

    const limitSelect = screen.getByLabelText("Rows per page");
    expect(limitSelect).toBeInTheDocument();
    expect(limitSelect).toHaveValue("10");

    const pagination = screen.getByRole("navigation", { name: "Pagination" });
    expect(pagination).toBeInTheDocument();

    const paginationTotal = screen.getByText("11 - 20 / 50");
    expect(paginationTotal).toBeInTheDocument();
  });

  it("updates URL search params when first is changed", () => {
    renderWithProviders(<TableFooter {...defaultProps} />);

    const limitSelect = screen.getByLabelText("Rows per page");
    fireEvent.change(limitSelect, { target: { value: "20" } });

    expect(mockSetSearchParams).toHaveBeenCalled();

    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    updateFn(params);

    expect(params.get("first")).toBe("20");
  });

  it("updates URL search params when page is changed", () => {
    const pageInfo = {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: "cursor1",
      endCursor: "cursor2",
    };
    renderWithProviders(<TableFooter {...defaultProps} pageInfo={pageInfo} />);

    const nextButton = screen.getByRole("button", { name: "Go to next page" });
    fireEvent.click(nextButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("renders without total", () => {
    const propsWithoutTotal = {
      first: defaultProps.first,
      currentPage: defaultProps.currentPage,
    };
    renderWithProviders(<TableFooter {...propsWithoutTotal} />);

    const paginationTotal = screen.getByText("1 - 1 / 1");
    expect(paginationTotal).toBeInTheDocument();
  });

  it("displays correct item range for first page", () => {
    renderWithProviders(<TableFooter first={15} currentPage={1} total={47} />);

    const paginationTotal = screen.getByText("1 - 15 / 47");
    expect(paginationTotal).toBeInTheDocument();
  });

  it("displays correct item range for last page with fewer items", () => {
    renderWithProviders(<TableFooter first={15} currentPage={4} total={47} />);

    const paginationTotal = screen.getByText("46 - 47 / 47");
    expect(paginationTotal).toBeInTheDocument();
  });

  it("handles edge case with zero total", () => {
    renderWithProviders(<TableFooter first={10} currentPage={1} total={0} />);

    const paginationTotal = screen.getByText("0 - 0 / 0");
    expect(paginationTotal).toBeInTheDocument();
  });

  it("handles large numbers correctly", () => {
    renderWithProviders(
      <TableFooter first={100} currentPage={5} total={1000} />,
    );

    const paginationTotal = screen.getByText("401 - 500 / 1000");
    expect(paginationTotal).toBeInTheDocument();
  });

  it("displays correct options in rows per page select", () => {
    renderWithProviders(<TableFooter {...defaultProps} />);

    const limitSelect = screen.getByLabelText("Rows per page");

    expect(limitSelect.querySelector('option[value="5"]')).toBeInTheDocument();
    expect(limitSelect.querySelector('option[value="10"]')).toBeInTheDocument();
    expect(limitSelect.querySelector('option[value="25"]')).toBeInTheDocument();
    expect(limitSelect.querySelector('option[value="50"]')).toBeInTheDocument();
    expect(
      limitSelect.querySelector('option[value="100"]'),
    ).toBeInTheDocument();
  });

  it("handles pagination with pageInfo correctly", () => {
    const pageInfo = {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: "cursor-start",
      endCursor: "cursor-end",
    };

    renderWithProviders(<TableFooter {...defaultProps} pageInfo={pageInfo} />);

    const prevButton = screen.getByRole("button", {
      name: "Go to previous page",
    });
    const nextButton = screen.getByRole("button", { name: "Go to next page" });

    expect(prevButton).toBeEnabled();
    expect(nextButton).toBeEnabled();

    fireEvent.click(prevButton);
    expect(mockSetSearchParams).toHaveBeenCalled();

    fireEvent.click(nextButton);
    expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
  });

  it("handles pagination 'first' direction correctly", () => {
    const pageInfo = {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: "cursor-start",
      endCursor: "cursor-end",
    };

    renderWithProviders(<TableFooter {...defaultProps} pageInfo={pageInfo} />);

    const firstButton = screen.getByRole("button", {
      name: "Go to first page",
    });
    fireEvent.click(firstButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    updateFn(params);

    expect(params.get("first")).toBe("10");
    expect(params.get("page")).toBe("1");
    expect(params.has("after")).toBe(false);
    expect(params.has("before")).toBe(false);
    expect(params.has("last")).toBe(false);
  });

  it("handles pagination 'next' direction with cursor correctly", () => {
    const pageInfo = {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: "cursor-start",
      endCursor: "cursor-end",
    };

    renderWithProviders(<TableFooter {...defaultProps} pageInfo={pageInfo} />);

    const nextButton = screen.getByRole("button", { name: "Go to next page" });
    fireEvent.click(nextButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    updateFn(params);

    expect(params.get("after")).toBe("cursor-end");
    expect(params.get("first")).toBe("10");
    expect(params.get("page")).toBe("3");
    expect(params.has("before")).toBe(false);
    expect(params.has("last")).toBe(false);
  });

  it("handles pagination 'prev' direction with cursor correctly", () => {
    const pageInfo = {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: "cursor-start",
      endCursor: "cursor-end",
    };

    renderWithProviders(
      <TableFooter first={10} currentPage={3} total={50} pageInfo={pageInfo} />,
    );

    const prevButton = screen.getByRole("button", {
      name: "Go to previous page",
    });
    fireEvent.click(prevButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    updateFn(params);

    expect(params.get("before")).toBe("cursor-start");
    expect(params.get("last")).toBe("10");
    expect(params.get("page")).toBe("2");
    expect(params.has("after")).toBe(false);
    expect(params.has("first")).toBe(false);
  });

  it("handles pagination when currentPage is 1 and going prev", () => {
    const pageInfo = {
      hasPreviousPage: true,
      hasNextPage: true,
      startCursor: "cursor-start",
      endCursor: "cursor-end",
    };

    renderWithProviders(
      <TableFooter first={10} currentPage={1} total={50} pageInfo={pageInfo} />,
    );

    const prevButton = screen.getByRole("button", {
      name: "Go to previous page",
    });
    fireEvent.click(prevButton);

    expect(mockSetSearchParams).toHaveBeenCalled();
    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    updateFn(params);

    expect(params.get("page")).toBe("1");
  });

  it("disables pagination buttons when appropriate", () => {
    const pageInfoFirstPage = {
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: "cursor-start",
      endCursor: "cursor-end",
    };

    renderWithProviders(
      <TableFooter {...defaultProps} pageInfo={pageInfoFirstPage} />,
    );

    const prevButton = screen.getByRole("button", {
      name: "Go to previous page",
    });
    const nextButton = screen.getByRole("button", { name: "Go to next page" });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeEnabled();
  });

  it("handles last parameter correctly", () => {
    renderWithProviders(<TableFooter {...defaultProps} last={15} />);

    const limitSelect = screen.getByLabelText("Rows per page");
    expect(limitSelect).toHaveValue("15");

    fireEvent.change(limitSelect, { target: { value: "25" } });

    expect(mockSetSearchParams).toHaveBeenCalled();
    const updateFn = mockSetSearchParams.mock.calls[0][0];
    const params = new URLSearchParams();
    updateFn(params);

    expect(params.get("last")).toBe("25");
  });
});
