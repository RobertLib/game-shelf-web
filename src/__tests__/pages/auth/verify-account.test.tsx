import { act, fireEvent, renderWithProviders, screen } from "../../test-utils";
import * as React from "react";
import logger from "../../../utils/logger";
import VerifyAccountPage from "../../../pages/auth/verify-account";

const mockNavigate = vi.fn();
const mockVerifyAccount = vi.fn();
const mockAlert = vi.fn();
const mockToken = "valid-verify-token";
const mockSearchParams = new URLSearchParams();
mockSearchParams.set("key", mockToken);

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
  useSearchParams: () => [mockSearchParams],
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
    use: () => ({ verifyAccount: mockVerifyAccount }),
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

describe("VerifyAccountPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.set("key", mockToken);
  });

  it("renders verify account form correctly", () => {
    renderWithProviders(<VerifyAccountPage />);

    expect(screen.getByText("Ověření účtu")).toBeInTheDocument();
    expect(
      screen.getByText("Zadejte nové heslo pro ověření vašeho účtu"),
    ).toBeInTheDocument();

    const passwordFields = screen.getAllByLabelText(/heslo/i, { exact: false });
    expect(passwordFields.length).toBe(2);

    expect(
      screen.getByRole("button", { name: "Ověřit účet" }),
    ).toBeInTheDocument();

    expect(screen.getByText("přihlášení")).toBeInTheDocument();
  });

  it("submits form with correct passwords and token", async () => {
    mockVerifyAccount.mockResolvedValue(null);

    renderWithProviders(<VerifyAccountPage />);

    const passwordFields = screen.getAllByLabelText(/heslo/i, { exact: false });

    fireEvent.change(passwordFields[0], {
      target: { value: "newPassword123" },
    });

    fireEvent.change(passwordFields[1], {
      target: { value: "newPassword123" },
    });

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      await capturedFormState(null, formData);
    });

    expect(mockVerifyAccount).toHaveBeenCalledWith(
      "newPassword123",
      "newPassword123",
      mockToken,
    );

    expect(mockAlert).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("displays general error message when account verification fails", async () => {
    const errors = {
      error: "Account verification failed",
      "field-error": [],
    };
    mockVerifyAccount.mockResolvedValue(errors);

    renderWithProviders(<VerifyAccountPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      await capturedFormState(null, formData);
    });

    expect(mockVerifyAccount).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("displays field-specific errors", async () => {
    const errors = {
      error: "Validation error",
      "field-error": ["password", "Password is too short"],
    };
    mockVerifyAccount.mockResolvedValue(errors);

    renderWithProviders(<VerifyAccountPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "short");
      formData.append("confirmPassword", "different");

      await capturedFormState(null, formData);
    });

    expect(mockVerifyAccount).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it("displays confirm password field error when field-error is for confirmPassword", async () => {
    const errors = {
      error: "Validation error",
      "field-error": ["confirmPassword", "Passwords do not match"] as [
        string,
        string,
      ],
    };
    mockVerifyAccount.mockResolvedValue(errors);

    renderWithProviders(<VerifyAccountPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "password123");
      formData.append("confirmPassword", "different");

      await capturedFormState(null, formData);
    });

    expect(mockVerifyAccount).toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to login page when clicking login link", () => {
    renderWithProviders(<VerifyAccountPage />);

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

    renderWithProviders(<VerifyAccountPage />);

    const submitButton = screen.getByRole("button", { name: "Ověřit účet" });
    expect(submitButton).toHaveAttribute("aria-busy", "true");
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  it("handles errors during form submission", async () => {
    const error = new Error("Network error");
    mockVerifyAccount.mockRejectedValue(error);

    renderWithProviders(<VerifyAccountPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      await capturedFormState(null, formData);
    });

    expect(logger.error).toHaveBeenCalled();
  });

  it("handles case when token is missing", async () => {
    mockSearchParams.delete("key");

    mockVerifyAccount.mockResolvedValue({
      error: "Invalid or expired token",
      "field-error": [],
    });

    renderWithProviders(<VerifyAccountPage />);

    await act(async () => {
      const formData = new FormData();
      formData.append("password", "newPassword123");
      formData.append("confirmPassword", "newPassword123");

      await capturedFormState(null, formData);
    });

    expect(mockVerifyAccount).toHaveBeenCalledWith(
      "newPassword123",
      "newPassword123",
      null,
    );
  });
});
