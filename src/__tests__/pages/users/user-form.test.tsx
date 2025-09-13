import {
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
} from "../../test-utils";
import { MockedProvider } from "@apollo/client/testing/react";
import { USER_CREATE, USER_UPDATE } from "../../../graphql/mutations/users";
import { UserRole, type User } from "../../../__generated__/graphql";
import UserForm from "../../../pages/users/user-form";

const mockNavigate = vi.fn();
const mockOnSuccess = vi.fn();
const mockEnqueueSnackbar = vi.fn();

vi.mock("react-router", async () => {
  return {
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../contexts/snackbar-context", () => ({
  default: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  },
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    use: vi.fn(() => ({
      enqueueSnackbar: mockEnqueueSnackbar,
    })),
  };
});

const mockUser: User = {
  id: "1",
  email: "test@example.com",
  role: UserRole.Admin,
  canShow: { value: true },
  canUpdate: { value: true },
  canDestroy: { value: true },
  createdAt: "",
  updatedAt: "",
};

const mockUserCreateMutation = {
  request: {
    query: USER_CREATE,
    variables: {
      input: {
        email: "new@example.com",
        role: UserRole.User,
      },
    },
  },
  result: {
    data: {
      userCreate: {
        id: "2",
      },
    },
  },
};

const mockUserUpdateMutation = {
  request: {
    query: USER_UPDATE,
    variables: {
      input: {
        id: "1",
        email: "updated@example.com",
        role: UserRole.Admin,
        password: "newpassword",
        confirmPassword: "newpassword",
      },
    },
  },
  result: {
    data: {
      userUpdate: {
        id: "1",
      },
    },
  },
};

const mockUserCreateMutationError = {
  request: {
    query: USER_CREATE,
    variables: {
      input: {
        email: "invalid@example.com",
        role: UserRole.User,
      },
    },
  },
  error: new Error("Validation failed"),
};

describe("UserForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnqueueSnackbar.mockClear();
  });

  describe("Create mode (no user prop)", () => {
    it("renders create form with all required fields", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm />
        </MockedProvider>,
      );

      expect(
        screen.getByRole("textbox", { name: /E-mail/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Uložit" }),
      ).toBeInTheDocument();

      const emailInput = screen.getByRole("textbox", { name: /E-mail/i });
      expect(emailInput).toHaveAttribute("name", "email");

      expect(screen.queryByDisplayValue("password")).not.toBeInTheDocument();
      expect(
        screen.queryByDisplayValue("confirmPassword"),
      ).not.toBeInTheDocument();
    });

    it("has correct form attributes and structure", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm />
        </MockedProvider>,
      );

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass("space-y-4");

      const emailInput = screen.getByRole("textbox", { name: /E-mail/i });
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
      expect(emailInput).toHaveAttribute("required");

      const roleSelect = screen.getByRole("combobox");
      expect(roleSelect).toHaveAttribute("required");
    });

    it("submits create form with correct data", async () => {
      renderWithProviders(
        <MockedProvider mocks={[mockUserCreateMutation]}>
          <UserForm onSuccess={mockOnSuccess} />
        </MockedProvider>,
      );

      const emailInput = screen.getByDisplayValue("");
      const roleSelect = screen.getByRole("combobox");
      const submitButton = screen.getByRole("button", { name: "Uložit" });

      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.change(roleSelect, { target: { value: UserRole.User } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });

    it("displays general error message on mutation error", async () => {
      const errorMutation = {
        ...mockUserCreateMutation,
        error: new Error("Server error"),
      };

      renderWithProviders(
        <MockedProvider mocks={[errorMutation]}>
          <UserForm />
        </MockedProvider>,
      );

      const emailInput = screen.getByDisplayValue("");
      const submitButton = screen.getByRole("button", { name: "Uložit" });

      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("displays field-specific errors from GraphQL validation", async () => {
      renderWithProviders(
        <MockedProvider mocks={[mockUserCreateMutationError]}>
          <UserForm />
        </MockedProvider>,
      );

      const emailInput = screen.getByDisplayValue("");
      const submitButton = screen.getByRole("button", { name: "Uložit" });

      fireEvent.change(emailInput, {
        target: { value: "invalid@example.com" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Validation failed")).toBeInTheDocument();
      });
    });
  });

  describe("Edit mode (with user prop)", () => {
    it("renders edit form with password fields", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm user={mockUser} />
        </MockedProvider>,
      );

      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();

      const passwordInputs = screen.getAllByDisplayValue("");
      const passwordInput = passwordInputs.find(
        (input) => input.getAttribute("name") === "password",
      );
      const confirmPasswordInput = passwordInputs.find(
        (input) => input.getAttribute("name") === "confirmPassword",
      );

      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Uložit" }),
      ).toBeInTheDocument();
    });

    it("pre-fills form with user data", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm user={mockUser} />
        </MockedProvider>,
      );

      const emailInput = screen.getByDisplayValue("test@example.com");
      const roleSelect = screen.getByRole("combobox");

      expect(emailInput).toHaveValue("test@example.com");
      expect(roleSelect).toHaveValue("Admin");
    });

    it("has correct password field attributes", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm user={mockUser} />
        </MockedProvider>,
      );

      const passwordInputs = screen.getAllByDisplayValue("");
      const passwordInput = passwordInputs.find(
        (input) => input.getAttribute("name") === "password",
      )!;
      const confirmPasswordInput = passwordInputs.find(
        (input) => input.getAttribute("name") === "confirmPassword",
      )!;

      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");
      expect(passwordInput).toHaveAttribute("autocomplete", "new-password");

      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("name", "confirmPassword");
      expect(confirmPasswordInput).toHaveAttribute(
        "autocomplete",
        "new-password",
      );
    });

    it("submits update form with correct data including passwords", async () => {
      renderWithProviders(
        <MockedProvider mocks={[mockUserUpdateMutation]}>
          <UserForm user={mockUser} onSuccess={mockOnSuccess} />
        </MockedProvider>,
      );

      const emailInput = screen.getByDisplayValue("test@example.com");
      const passwordInputs = screen.getAllByDisplayValue("");
      const passwordInput = passwordInputs.find(
        (input) => input.getAttribute("name") === "password",
      )!;
      const confirmPasswordInput = passwordInputs.find(
        (input) => input.getAttribute("name") === "confirmPassword",
      )!;
      const submitButton = screen.getByRole("button", { name: "Uložit" });

      fireEvent.change(emailInput, {
        target: { value: "updated@example.com" },
      });
      fireEvent.change(passwordInput, { target: { value: "newpassword" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "newpassword" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });
  });

  describe("Loading states", () => {
    it("shows loading state on submit button during mutation", async () => {
      const slowMutation = {
        ...mockUserCreateMutation,
        delay: 100,
      };

      renderWithProviders(
        <MockedProvider mocks={[slowMutation]}>
          <UserForm />
        </MockedProvider>,
      );

      const emailInput = screen.getByDisplayValue("");
      const submitButton = screen.getByRole("button", { name: "Uložit" });

      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.click(submitButton);

      expect(submitButton).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Role options", () => {
    it("displays all available user roles", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm />
        </MockedProvider>,
      );

      const roleSelect = screen.getByRole("combobox");
      fireEvent.click(roleSelect);

      const expectedRoles = ["Admin", "User"];
      expectedRoles.forEach((role) => {
        expect(screen.getByText(role)).toBeInTheDocument();
      });
    });

    it("has default role User for new users", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm />
        </MockedProvider>,
      );

      const roleSelect = screen.getByRole("combobox");
      expect(roleSelect).toHaveValue("User");
    });
  });

  describe("Success handling", () => {
    it("navigates back on successful form submission", async () => {
      renderWithProviders(
        <MockedProvider mocks={[mockUserCreateMutation]}>
          <UserForm />
        </MockedProvider>,
      );

      const emailInput = screen.getByDisplayValue("");
      const submitButton = screen.getByRole("button", { name: "Uložit" });

      fireEvent.change(emailInput, { target: { value: "new@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });
  });

  describe("Form validation and accessibility", () => {
    it("has proper form accessibility attributes", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm />
        </MockedProvider>,
      );

      const emailInput = screen.getByDisplayValue("");
      const roleSelect = screen.getByRole("combobox");

      expect(emailInput).toHaveAttribute("required");
      expect(roleSelect).toHaveAttribute("required");
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("prevents form submission when required fields are empty", () => {
      renderWithProviders(
        <MockedProvider mocks={[]}>
          <UserForm />
        </MockedProvider>,
      );

      const submitButton = screen.getByRole("button", { name: "Uložit" });

      fireEvent.click(submitButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
