import { GET_USER_DETAIL } from "../../../graphql/queries/users";
import { MockedProvider } from "@apollo/client/testing/react";
import { renderWithProviders, screen } from "../../test-utils";
import { waitFor } from "@testing-library/react";
import UserDetailPage from "../../../pages/users/user-detail";

vi.mock("../../../pages/not-found", () => ({
  default: () => <div data-testid="not-found">Not Found Component</div>,
}));

const mockParams = { id: "1" };
const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  return {
    Link: ({
      children,
      to,
      className,
    }: {
      children: React.ReactNode;
      to: string;
      className?: string;
    }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
  };
});

const mockUserData = {
  id: "1",
  email: "test@example.com",
  role: "ADMIN",
  status: "ACTIVE",
};

const mockUserDetailQuery = {
  request: {
    query: GET_USER_DETAIL,
    variables: { id: "1" },
  },
  result: {
    data: {
      user: mockUserData,
    },
  },
  delay: 100,
};

const mockUserDetailQueryNotFound = {
  delay: 100,
  request: {
    query: GET_USER_DETAIL,
    variables: { id: "1" },
  },
  result: {
    data: {
      user: null,
    },
  },
};

const mockUserDetailQueryLoading = {
  request: {
    query: GET_USER_DETAIL,
    variables: { id: "1" },
  },
  delay: Infinity,
};

describe("UserDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.id = "1";
  });

  it("renders user detail when data is loaded", async () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQuery]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("test@example.com")).toHaveLength(3);
    });
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders breadcrumbs with correct navigation", async () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQuery]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    await screen.findByRole("heading", { level: 1 });

    expect(screen.getByText("Uživatelé")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders header with back button and user email as title", async () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQuery]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "test@example.com",
      );
    });
  });

  it("renders description list with user details", async () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQuery]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    expect(screen.getByText("E-mail:")).toBeInTheDocument();
    expect(screen.getByText("Role:")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("test@example.com")).toHaveLength(3);
    });
  });

  it("renders panel with user information", async () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQuery]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    await screen.findByRole("heading", { level: 1 });

    const panel = screen.getByText("E-mail:").closest("div");
    expect(panel).toBeInTheDocument();
  });

  it("shows NotFound component when user is not found", async () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQueryNotFound]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    expect(await screen.findByTestId("not-found")).toBeInTheDocument();
  });

  it("doesn't show NotFound component while loading", () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQueryLoading]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    expect(screen.queryByTestId("not-found")).not.toBeInTheDocument();
  });

  it("renders page structure correctly", async () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQuery]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    await screen.findByRole("heading", { level: 1 });

    const mainContainer = screen
      .getByRole("heading", { level: 1 })
      .closest("div.p-4");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("p-4");
  });

  it("uses correct dictionary keys", async () => {
    renderWithProviders(
      <MockedProvider mocks={[mockUserDetailQuery]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    await screen.findByRole("heading", { level: 1 });

    expect(screen.getByText("Uživatelé")).toBeInTheDocument();
    expect(screen.getByText("E-mail:")).toBeInTheDocument();
    expect(screen.getByText("Role:")).toBeInTheDocument();
  });

  it("handles different user roles correctly", async () => {
    const mockUserCustomer = {
      ...mockUserData,
      role: "USER",
    };

    const mockQueryCustomer = {
      request: {
        query: GET_USER_DETAIL,
        variables: { id: "1" },
      },
      result: {
        data: {
          user: mockUserCustomer,
        },
      },
      delay: 100,
    };

    renderWithProviders(
      <MockedProvider mocks={[mockQueryCustomer]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "test@example.com",
      );
    });
    expect(screen.getByText("Uživatel")).toBeInTheDocument();
  });

  it("handles different user emails correctly", async () => {
    const mockUserDifferentEmail = {
      ...mockUserData,
      email: "different@example.com",
    };

    const mockQueryDifferentEmail = {
      request: {
        query: GET_USER_DETAIL,
        variables: { id: "1" },
      },
      result: {
        data: {
          user: mockUserDifferentEmail,
        },
      },
      delay: 100,
    };

    renderWithProviders(
      <MockedProvider mocks={[mockQueryDifferentEmail]}>
        <UserDetailPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "different@example.com",
      );
    });

    expect(screen.getAllByText("different@example.com")).toHaveLength(3);
  });
});
