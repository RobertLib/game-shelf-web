import { ProtectedRoute } from "../../components/protected-route";
import {
  renderWithProviders,
  rerenderWithProviders,
  screen,
} from "../test-utils";
import SessionContext from "../../contexts/session-context";

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => {
    mockNavigate(to, replace);
    return <div data-testid="navigate" data-to={to} data-replace={replace} />;
  },
}));

const mockSessionContext = {
  currentUser: null as { id: number; email: string; role: string } | null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyAccount: vi.fn(),
};

function MockSessionProvider({
  children,
  value = mockSessionContext,
}: {
  children: React.ReactNode;
  value?: typeof mockSessionContext;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user is authenticated", () => {
    const contextValue = {
      ...mockSessionContext,
      currentUser: { id: 1, email: "test@example.com", role: "user" },
      isLoading: false,
    };

    renderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("renders children when still loading", () => {
    const contextValue = {
      ...mockSessionContext,
      currentUser: null,
      isLoading: true,
    };

    renderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated and not loading", () => {
    const contextValue = {
      ...mockSessionContext,
      currentUser: null,
      isLoading: false,
    };

    renderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/login");
    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-replace",
      "true",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/login", true);
  });

  it("does not redirect when loading is true even if user is null", () => {
    const contextValue = {
      ...mockSessionContext,
      currentUser: null,
      isLoading: true,
    };

    renderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders multiple children correctly when authenticated", () => {
    const contextValue = {
      ...mockSessionContext,
      currentUser: { id: 1, email: "test@example.com", role: "admin" },
      isLoading: false,
    };

    renderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <span>Text node</span>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByText("Text node")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("handles different user roles correctly", () => {
    const userRoles = ["user", "admin", "moderator"];

    userRoles.forEach((role) => {
      const contextValue = {
        ...mockSessionContext,
        currentUser: { id: 1, email: "test@example.com", role },
        isLoading: false,
      };

      const { unmount } = renderWithProviders(
        <MockSessionProvider value={contextValue}>
          <ProtectedRoute>
            <div data-testid="protected-content">Content for {role}</div>
          </ProtectedRoute>
        </MockSessionProvider>,
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(screen.getByText(`Content for ${role}`)).toBeInTheDocument();
      expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();

      unmount();
    });
  });

  it("handles edge case with undefined currentUser", () => {
    const contextValue = {
      ...mockSessionContext,
      currentUser: null,
      isLoading: false,
    };

    renderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/login", true);
  });

  it("handles transition from loading to authenticated", () => {
    let contextValue = {
      ...mockSessionContext,
      currentUser: null as { id: number; email: string; role: string } | null,
      isLoading: true,
    };

    renderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();

    contextValue = {
      ...mockSessionContext,
      currentUser: { id: 1, email: "test@example.com", role: "user" },
      isLoading: false,
    };

    rerenderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("handles transition from loading to unauthenticated", () => {
    let contextValue = {
      ...mockSessionContext,
      currentUser: null,
      isLoading: true,
    };

    renderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();

    contextValue = {
      ...mockSessionContext,
      currentUser: null,
      isLoading: false,
    };

    rerenderWithProviders(
      <MockSessionProvider value={contextValue}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockSessionProvider>,
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/login", true);
  });
});
