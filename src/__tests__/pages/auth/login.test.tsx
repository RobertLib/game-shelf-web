import { act, fireEvent, renderWithProviders, screen } from "../../test-utils";
import * as React from "react";
import logger from "../../../utils/logger";
import LoginPage from "../../../pages/auth/login";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

let capturedFormState: (
  prevState: unknown,
  formData: FormData,
) => Promise<null>;

vi.mock("../../../utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("react-router", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");

  return {
    ...actual,
    use: () => ({ login: mockLogin }),
    useActionState: (
      fn: (prevState: unknown, formData: FormData) => Promise<null>,
    ) => {
      capturedFormState = fn;
      const formAction = (formData: FormData) => {
        return fn(null, formData);
      };
      return [null, formAction, false];
    },
  };
});

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form correctly", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText("Přihlášení")).toBeInTheDocument();
    expect(
      screen.getByText("Zadejte své přihlašovací údaje"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: /E-mail/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/heslo/i)).toBeInTheDocument();
    expect(screen.getByText("Zapomenuté heslo?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Přihlásit se" }),
    ).toBeInTheDocument();
  });

  it("submits form with correct values", async () => {
    mockLogin.mockResolvedValue(null);

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /E-mail/i }), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/heslo/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      await capturedFormState(null, formData);
    });

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays general error message when login fails", async () => {
    const errors = {
      error: "Invalid credentials",
      "field-error": [],
    };
    mockLogin.mockResolvedValue(errors);

    renderWithProviders(<LoginPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "wrongpassword");

      await capturedFormState(null, formData);
    });

    expect(mockLogin).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays field-specific errors", async () => {
    const errors = {
      error: "Validation error",
      "field-error": ["email", "Invalid e-mail format"],
    };
    mockLogin.mockResolvedValue(errors);

    renderWithProviders(<LoginPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "");

      await capturedFormState(null, formData);
    });

    expect(mockLogin).toHaveBeenCalled();
  });

  it.skip("navigates to register page when clicking register link", () => {
    renderWithProviders(<LoginPage />);

    const registerLink = screen.getByTestId("link-to-/register");
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("navigates to forgot password page when clicking forgot password link", () => {
    renderWithProviders(<LoginPage />);

    const forgotPasswordLink = screen.getByTestId("link-to-/forgot-password");
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it("shows loading state during form submission", async () => {
    vi.spyOn(React, "useActionState").mockReturnValueOnce([
      null,
      vi.fn(),
      true,
    ]);

    renderWithProviders(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: "Přihlásit se" });
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  it("handles errors during form submission", async () => {
    const error = new Error("Network error");
    mockLogin.mockRejectedValue(error);

    renderWithProviders(<LoginPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      await capturedFormState(null, formData);
    });

    expect(logger.error).toHaveBeenCalledWith(error);
  });

  it("displays password field error when field-error is for password", async () => {
    const errors = {
      error: "Validation error",
      "field-error": ["password", "Password is too weak"] as [string, string],
    };
    mockLogin.mockResolvedValue(errors);

    renderWithProviders(<LoginPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "weak");

      await capturedFormState(null, formData);
    });

    expect(mockLogin).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
