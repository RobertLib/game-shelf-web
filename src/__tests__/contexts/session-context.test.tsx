import { GET_AUTHORIZATION } from "../../graphql/queries/authorization";
import { MockedProvider } from "@apollo/client/testing/react";
import { mockLocalStorage } from "../setup";
import { render, screen, waitFor } from "../test-utils";
import { SessionProvider } from "../../contexts/session-context";
import { use } from "react";
import SessionContext from "../../contexts/session-context";
import type { AuthError, User } from "../../lib/auth";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockLoginUser = vi.hoisted(() => vi.fn());
const mockLogoutUser = vi.hoisted(() => vi.fn());
const mockRegisterUser = vi.hoisted(() => vi.fn());
const mockForgotUserPassword = vi.hoisted(() => vi.fn());
const mockResetUserPassword = vi.hoisted(() => vi.fn());
const mockVerifyUserAccount = vi.hoisted(() => vi.fn());

vi.mock("../../lib/auth", () => ({
  getSession: mockGetSession,
  loginUser: mockLoginUser,
  logoutUser: mockLogoutUser,
  registerUser: mockRegisterUser,
  forgotUserPassword: mockForgotUserPassword,
  resetUserPassword: mockResetUserPassword,
  verifyUserAccount: mockVerifyUserAccount,
}));

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

const mockUser: User = {
  id: 1,
  email: "test@example.com",
  role: "user",
};

const mockAuthError: AuthError = {
  error: "Neplatný email nebo heslo",
  "field-error": ["email", "Email je povinný"],
};

const authorizationMock = {
  request: {
    query: GET_AUTHORIZATION,
    variables: {},
  },
  result: {
    data: {
      authorization: {
        canCreateUser: {
          value: true,
        },
        canIndexUsers: {
          value: true,
        },
      },
    },
  },
  newData: () => ({
    data: {
      authorization: {
        canCreateUser: {
          value: true,
        },
        canIndexUsers: {
          value: true,
        },
      },
    },
  }),
};

function TestSessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MockedProvider mocks={[authorizationMock]}>
      <SessionProvider>{children}</SessionProvider>
    </MockedProvider>
  );
}

function TestComponent() {
  const {
    currentUser,
    isLoading,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    verifyAccount,
  } = use(SessionContext);

  return (
    <div>
      <span data-testid="current-user">
        {currentUser ? currentUser.email : "null"}
      </span>
      <span data-testid="is-loading">{isLoading.toString()}</span>
      <button
        data-testid="login-button"
        onClick={() => login("test@example.com", "password")}
      >
        Login
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
      <button
        data-testid="register-button"
        onClick={() => register("test@example.com", "password", "password")}
      >
        Register
      </button>
      <button
        data-testid="forgot-password-button"
        onClick={() => forgotPassword("test@example.com")}
      >
        Forgot Password
      </button>
      <button
        data-testid="reset-password-button"
        onClick={() => resetPassword("newpassword", "newpassword", "token")}
      >
        Reset Password
      </button>
      <button
        data-testid="verify-account-button"
        onClick={() => verifyAccount("newpassword", "newpassword", "token")}
      >
        Verify Account
      </button>
    </div>
  );
}

describe("SessionContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it("renders children correctly", async () => {
    mockGetSession.mockResolvedValue(null);

    render(
      <TestSessionProvider>
        <div data-testid="test-child">Test Child</div>
      </TestSessionProvider>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalledTimes(1);
    });
  });

  it("initializes with loading state and no user", async () => {
    mockGetSession.mockResolvedValue(null);

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    expect(screen.getByTestId("is-loading")).toHaveTextContent("true");
    expect(screen.getByTestId("current-user")).toHaveTextContent("null");

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });

  it("loads user session on initialization", async () => {
    mockGetSession.mockResolvedValue({ user: mockUser });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-user")).toHaveTextContent(
        mockUser.email,
      );
    });

    expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });

  it("handles successful login", async () => {
    mockGetSession.mockResolvedValue(null);
    mockLoginUser.mockResolvedValue({ success: true, user: mockUser });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("login-button").click();

    await waitFor(() => {
      expect(screen.getByTestId("current-user")).toHaveTextContent(
        mockUser.email,
      );
    });

    expect(mockLoginUser).toHaveBeenCalledWith("test@example.com", "password");
  });

  it("handles login error", async () => {
    mockGetSession.mockResolvedValue(null);
    mockLoginUser.mockResolvedValue({ success: false, error: mockAuthError });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("login-button").click();

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith(
        "test@example.com",
        "password",
      );
    });

    expect(screen.getByTestId("current-user")).toHaveTextContent("null");
  });

  it("handles logout", async () => {
    mockGetSession.mockResolvedValue({ user: mockUser });
    mockLogoutUser.mockResolvedValue(undefined);

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-user")).toHaveTextContent(
        mockUser.email,
      );
    });

    screen.getByTestId("logout-button").click();

    await waitFor(() => {
      expect(screen.getByTestId("current-user")).toHaveTextContent("null");
    });

    expect(mockLogoutUser).toHaveBeenCalledTimes(1);
  });

  it("handles successful registration", async () => {
    mockGetSession.mockResolvedValue(null);
    mockRegisterUser.mockResolvedValue({ success: true, user: mockUser });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("register-button").click();

    await waitFor(() => {
      expect(screen.getByTestId("current-user")).toHaveTextContent(
        mockUser.email,
      );
    });

    expect(mockRegisterUser).toHaveBeenCalledWith(
      "test@example.com",
      "password",
      "password",
    );
  });

  it("handles registration error", async () => {
    mockGetSession.mockResolvedValue(null);
    mockRegisterUser.mockResolvedValue({
      success: false,
      error: mockAuthError,
    });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("register-button").click();

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith(
        "test@example.com",
        "password",
        "password",
      );
    });

    expect(screen.getByTestId("current-user")).toHaveTextContent("null");
  });

  it("handles successful forgot password", async () => {
    mockGetSession.mockResolvedValue(null);
    mockForgotUserPassword.mockResolvedValue({ success: true });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("forgot-password-button").click();

    await waitFor(() => {
      expect(mockForgotUserPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("handles forgot password error", async () => {
    mockGetSession.mockResolvedValue(null);
    mockForgotUserPassword.mockResolvedValue({
      success: false,
      error: mockAuthError,
    });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("forgot-password-button").click();

    await waitFor(() => {
      expect(mockForgotUserPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("handles successful password reset", async () => {
    mockGetSession.mockResolvedValue(null);
    mockResetUserPassword.mockResolvedValue({ success: true });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("reset-password-button").click();

    await waitFor(() => {
      expect(mockResetUserPassword).toHaveBeenCalledWith(
        "newpassword",
        "newpassword",
        "token",
      );
    });
  });

  it("handles password reset error", async () => {
    mockGetSession.mockResolvedValue(null);
    mockResetUserPassword.mockResolvedValue({
      success: false,
      error: mockAuthError,
    });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("reset-password-button").click();

    await waitFor(() => {
      expect(mockResetUserPassword).toHaveBeenCalledWith(
        "newpassword",
        "newpassword",
        "token",
      );
    });
  });

  it("handles getSession error gracefully", async () => {
    mockGetSession.mockRejectedValue(new Error("Session error"));

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("current-user")).toHaveTextContent("null");
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });

  it("handles successful account verification", async () => {
    mockGetSession.mockResolvedValue(null);
    mockVerifyUserAccount.mockResolvedValue({ success: true });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("verify-account-button").click();

    await waitFor(() => {
      expect(mockVerifyUserAccount).toHaveBeenCalledWith(
        "newpassword",
        "newpassword",
        "token",
      );
    });
  });

  it("handles account verification error", async () => {
    mockGetSession.mockResolvedValue(null);
    mockVerifyUserAccount.mockResolvedValue({
      success: false,
      error: mockAuthError,
    });

    render(
      <TestSessionProvider>
        <TestComponent />
      </TestSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    screen.getByTestId("verify-account-button").click();

    await waitFor(() => {
      expect(mockVerifyUserAccount).toHaveBeenCalledWith(
        "newpassword",
        "newpassword",
        "token",
      );
    });
  });
});
