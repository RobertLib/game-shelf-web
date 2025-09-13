import { act, fireEvent, renderWithProviders, screen } from "../../test-utils";
import * as React from "react";
import ForgotPasswordPage from "../../../pages/auth/forgot-password";
import logger from "../../../utils/logger";

const mockNavigate = vi.fn();
const mockForgotPassword = vi.fn();
const mockAlert = vi.fn();

let capturedFormState: (
  prevState: unknown,
  formData: FormData,
) => Promise<null>;

global.alert = mockAlert;

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
}));

vi.mock("../../../utils/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");

  return {
    ...actual,
    use: () => ({ forgotPassword: mockForgotPassword }),
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

describe("ForgotPasswordPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders forgot password form correctly", () => {
    renderWithProviders(<ForgotPasswordPage />);

    expect(screen.getByText("Obnova hesla")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Zadejte svůj e-mail a my vám pošleme odkaz pro obnovu hesla",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: /e-mail/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Odeslat odkaz pro obnovu hesla" }),
    ).toBeInTheDocument();

    expect(screen.getByText("přihlášení")).toBeInTheDocument();
  });

  it("submits form with correct email", async () => {
    mockForgotPassword.mockResolvedValue(null);

    renderWithProviders(<ForgotPasswordPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /e-mail/i }), {
      target: { value: "test@example.com" },
    });

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");

      await capturedFormState(null, formData);
    });

    expect(mockForgotPassword).toHaveBeenCalledWith("test@example.com");
    expect(mockAlert).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays general error message when password reset request fails", async () => {
    const errors = {
      error: "E-mail not found",
      "field-error": [],
    };
    mockForgotPassword.mockResolvedValue(errors);

    renderWithProviders(<ForgotPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "nonexistent@example.com");

      await capturedFormState(null, formData);
    });

    expect(mockForgotPassword).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays field-specific errors", async () => {
    const errors = {
      error: "Validation error",
      "field-error": ["email", "Invalid e-mail format"],
    };
    mockForgotPassword.mockResolvedValue(errors);

    renderWithProviders(<ForgotPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");

      await capturedFormState(null, formData);
    });

    expect(mockForgotPassword).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it("navigates to login page when clicking login link", () => {
    renderWithProviders(<ForgotPasswordPage />);

    const loginLink = screen.getByTestId("link-to-/login");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows loading state during form submission", async () => {
    vi.spyOn(React, "useActionState").mockReturnValueOnce([
      null,
      vi.fn(),
      true,
    ]);

    renderWithProviders(<ForgotPasswordPage />);

    const submitButton = screen.getByRole("button", {
      name: "Odeslat odkaz pro obnovu hesla",
    });
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  it("handles errors during form submission", async () => {
    const error = new Error("Network error");
    mockForgotPassword.mockRejectedValue(error);

    renderWithProviders(<ForgotPasswordPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");

      await capturedFormState(null, formData);
    });

    expect(logger.error).toHaveBeenCalled();
  });
});
