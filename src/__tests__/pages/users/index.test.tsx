import { GET_AUTHORIZATION } from "../../../graphql/queries/authorization";
import { MockedProvider } from "@apollo/client/testing/react";
import { renderWithProviders, screen } from "../../test-utils";
import SessionContext from "../../../contexts/session-context";
import UsersPage from "../../../pages/users";

vi.mock("../../../pages/users/user-table", () => ({
  default: () => <div data-testid="user-table">UserTable Component</div>,
}));

const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

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
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useLocation: () => ({ pathname: "/" }),
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
  };
});

const mockAuthorizationWithPermission = {
  request: {
    query: GET_AUTHORIZATION,
  },
  result: {
    data: {
      authorization: {
        canCreateUser: { value: true },
        canIndexUsers: { value: true },
      },
    },
  },
};

const mockSessionContextWithPermission = {
  authorization: {
    canCreateUser: { value: true },
    canIndexUsers: { value: true },
  },
  currentUser: { id: 1, email: "test@example.com", role: "admin" },
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyAccount: vi.fn(),
};

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Array.from(mockSearchParams.keys())) {
      mockSearchParams.delete(key);
    }
  });

  it("renders users page when user has permission", () => {
    renderWithProviders(
      <MockedProvider mocks={[mockAuthorizationWithPermission]}>
        <SessionContext value={mockSessionContextWithPermission}>
          <UsersPage />
        </SessionContext>
      </MockedProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Uživatelé",
    );
    expect(screen.getByTestId("user-table")).toBeInTheDocument();
  });

  it("renders breadcrumbs with correct content", () => {
    renderWithProviders(
      <MockedProvider mocks={[mockAuthorizationWithPermission]}>
        <SessionContext value={mockSessionContextWithPermission}>
          <UsersPage />
        </SessionContext>
      </MockedProvider>,
    );

    expect(screen.getByText("Domů")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders header with new user action button", () => {
    renderWithProviders(
      <MockedProvider mocks={[mockAuthorizationWithPermission]}>
        <SessionContext value={mockSessionContextWithPermission}>
          <UsersPage />
        </SessionContext>
      </MockedProvider>,
    );

    const newUserButton = screen.getByText("Nový").closest("a");
    expect(newUserButton).toBeInTheDocument();
    expect(newUserButton).toHaveClass("btn");
  });

  it("new user button has correct href with dialog parameter", () => {
    renderWithProviders(
      <MockedProvider mocks={[mockAuthorizationWithPermission]}>
        <SessionContext value={mockSessionContextWithPermission}>
          <UsersPage />
        </SessionContext>
      </MockedProvider>,
    );

    const newUserButton = screen.getByText("Nový").closest("a");
    expect(newUserButton).toHaveAttribute("href", "/users?dialog=userForm");
  });

  it("preserves existing search params when adding dialog parameter", () => {
    mockSearchParams.set("page", "2");
    mockSearchParams.set("sortBy", "email");

    renderWithProviders(
      <MockedProvider mocks={[mockAuthorizationWithPermission]}>
        <SessionContext value={mockSessionContextWithPermission}>
          <UsersPage />
        </SessionContext>
      </MockedProvider>,
    );

    const newUserButton = screen.getByText("Nový").closest("a");
    const href = newUserButton?.getAttribute("href");

    expect(href).toContain("page=2");
    expect(href).toContain("sortBy=email");
    expect(href).toContain("dialog=userForm");
  });

  it("renders correctly with empty search params", () => {
    renderWithProviders(
      <MockedProvider mocks={[mockAuthorizationWithPermission]}>
        <SessionContext value={mockSessionContextWithPermission}>
          <UsersPage />
        </SessionContext>
      </MockedProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Uživatelé",
    );
    expect(screen.getByTestId("user-table")).toBeInTheDocument();

    const newUserButton = screen.getByText("Nový").closest("a");
    expect(newUserButton).toHaveAttribute("href", "/users?dialog=userForm");
  });

  it("renders page structure correctly", () => {
    renderWithProviders(
      <MockedProvider mocks={[mockAuthorizationWithPermission]}>
        <SessionContext value={mockSessionContextWithPermission}>
          <UsersPage />
        </SessionContext>
      </MockedProvider>,
    );

    const mainContainer = screen
      .getByRole("heading", { level: 1 })
      .closest("div.p-4");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("p-4");
  });

  it("uses correct dictionary keys", () => {
    renderWithProviders(
      <MockedProvider mocks={[mockAuthorizationWithPermission]}>
        <SessionContext value={mockSessionContextWithPermission}>
          <UsersPage />
        </SessionContext>
      </MockedProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Uživatelé",
    );
    expect(screen.getByText("Nový")).toBeInTheDocument();
    expect(screen.getByText("Domů")).toBeInTheDocument();
  });
});
