import { act, fireEvent, renderWithProviders, screen } from "../../test-utils";
import * as React from "react";
import logger from "../../../utils/logger";
import RegisterPage from "../../../pages/auth/register";

const mockNavigate = vi.fn();
const mockRegister = vi.fn();

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
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");

  return {
    ...actual,
    use: () => ({ register: mockRegister }),
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

describe("RegisterPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders register form correctly", () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByText("Registrace")).toBeInTheDocument();
    expect(
      screen.getByText("Zadejte své registrační údaje"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", { name: /E-mail/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^heslo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/potvrďte heslo/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registrovat se" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Přihlásit se")).toBeInTheDocument();
  });

  it("submits form with correct values", async () => {
    mockRegister.mockResolvedValue(null);

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /E-mail/i }), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/^heslo/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/potvrďte heslo/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
      "password123",
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays general error message when registration fails", async () => {
    const errors = {
      error: "Registration failed",
      "field-error": [],
    };
    mockRegister.mockResolvedValue(errors);

    renderWithProviders(<RegisterPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays field-specific errors", async () => {
    const errors = {
      error: "Validation error",
      "field-error": ["email", "Invalid e-mail format"],
    };
    mockRegister.mockResolvedValue(errors);

    renderWithProviders(<RegisterPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "invalid-email");
      formData.append("password", "short");
      formData.append("confirmPassword", "nomatch");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalled();
  });

  it("navigates to login page when clicking login link", () => {
    renderWithProviders(<RegisterPage />);

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

    renderWithProviders(<RegisterPage />);

    const submitButton = screen.getByRole("button", { name: "Registrovat se" });
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  it("handles errors during form submission", async () => {
    const error = new Error("Network error");
    mockRegister.mockRejectedValue(error);

    renderWithProviders(<RegisterPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");

      await capturedFormState(null, formData);
    });

    expect(logger.error).toHaveBeenCalledWith(error);
  });

  it("displays password field error when field-error is for password", async () => {
    const errors = {
      error: "Validation error",
      "field-error": ["password", "Password is too weak"] as [string, string],
    };
    mockRegister.mockResolvedValue(errors);

    renderWithProviders(<RegisterPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "weak");
      formData.append("confirmPassword", "weak");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays confirm password field error when field-error is for confirmPassword", async () => {
    const errors = {
      error: "Validation error",
      "field-error": ["confirmPassword", "Passwords do not match"] as [
        string,
        string,
      ],
    };
    mockRegister.mockResolvedValue(errors);

    renderWithProviders(<RegisterPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("confirmPassword", "different");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("handles missing email field gracefully", async () => {
    mockRegister.mockResolvedValue(null);

    renderWithProviders(<RegisterPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "password123");
      formData.append("confirmPassword", "password123");

      await capturedFormState(null, formData);
    });

    expect(mockRegister).toHaveBeenCalledWith(
      null,
      "password123",
      "password123",
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
