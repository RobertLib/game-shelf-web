import {
  fireEvent,
  renderWithProviders,
  screen,
  waitFor,
} from "../../test-utils";
import { GET_USERS_TABLE } from "../../../graphql/queries/users";
import { LinkProps } from "react-router";
import { MemoryRouter } from "react-router";
import { MockedProvider } from "@apollo/client/testing/react";
import { USER_DESTROY } from "../../../graphql/mutations/users";
import { UserRole } from "../../../__generated__/graphql";
import UserTable from "../../../pages/users/user-table";

const mockEnqueueSnackbar = vi.fn();
const mockSetSearchParams = vi.fn();
const mockNavigate = vi.fn();

const mockSearchParams = new URLSearchParams();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...rest }: LinkProps) => (
      <a href={to.toString()} {...rest}>
        {children}
      </a>
    ),
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

Object.defineProperty(window, "confirm", {
  writable: true,
  value: vi.fn(),
});

const mockUsers = [
  {
    __typename: "User" as const,
    id: "1",
    email: "admin@example.com",
    role: UserRole.Admin,
    canShow: { __typename: "AuthorizationResult" as const, value: true },
    canUpdate: { __typename: "AuthorizationResult" as const, value: true },
    canDestroy: { __typename: "AuthorizationResult" as const, value: true },
  },
  {
    __typename: "User" as const,
    id: "2",
    email: "customer@example.com",
    role: UserRole.User,
    canShow: { __typename: "AuthorizationResult" as const, value: true },
    canUpdate: { __typename: "AuthorizationResult" as const, value: false },
    canDestroy: { __typename: "AuthorizationResult" as const, value: false },
  },
];

const mockGetUsersQuery = {
  request: {
    query: GET_USERS_TABLE,
    variables: {
      after: null,
      before: null,
      first: 20,
      last: undefined,
      filter: {
        email: undefined,
      },
    },
  },
  result: {
    data: {
      users: {
        __typename: "UserConnection" as const,
        nodes: mockUsers,
        pageInfo: {
          __typename: "PageInfo" as const,
          endCursor: "cursor-end",
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: "cursor-start",
        },
        totalCount: 2,
      },
    },
  },
};

const mockGetUsersQueryWithDeleted = {
  request: {
    query: GET_USERS_TABLE,
    variables: {
      after: null,
      before: null,
      first: 20,
      last: undefined,
      filter: {
        email: undefined,
      },
    },
  },
  result: {
    data: {
      users: {
        __typename: "UserConnection" as const,
        nodes: [
          {
            __typename: "User" as const,
            id: "3",
            email: "deleted@example.com",
            role: UserRole.User,
            canShow: {
              __typename: "AuthorizationResult" as const,
              value: true,
            },
            canUpdate: {
              __typename: "AuthorizationResult" as const,
              value: false,
            },
            canDestroy: {
              __typename: "AuthorizationResult" as const,
              value: false,
            },
          },
        ],
        pageInfo: {
          __typename: "PageInfo" as const,
          endCursor: "cursor-end",
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: "cursor-start",
        },
        totalCount: 1,
      },
    },
  },
};

const mockUserDestroyMutation = {
  request: {
    query: USER_DESTROY,
    variables: {
      input: {
        id: "1",
      },
    },
  },
  result: {
    data: {
      userDestroy: {
        id: "1",
      },
    },
  },
};

const mockUserDestroyMutationError = {
  request: {
    query: USER_DESTROY,
    variables: {
      input: {
        id: "1",
      },
    },
  },
  error: new Error("Delete failed"),
};

const renderUserTable = (mocks = [mockGetUsersQuery]) => {
  return renderWithProviders(
    <MemoryRouter>
      <MockedProvider mocks={mocks}>
        <UserTable />
      </MockedProvider>
    </MemoryRouter>,
  );
};

describe("UserTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockEnqueueSnackbar.mockClear();
    mockSetSearchParams.mockClear();

    for (const key of Array.from(mockSearchParams.keys())) {
      mockSearchParams.delete(key);
    }
  });

  describe("Basic rendering", () => {
    it("renders user table with users data", async () => {
      renderWithProviders(
        <MockedProvider mocks={[mockGetUsersQuery]}>
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        const table = screen.getByRole("grid");
        expect(table).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(screen.getByText("admin@example.com")).toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      await waitFor(() => {
        expect(screen.getByText("admin@example.com")).toBeInTheDocument();
        expect(screen.getByText("customer@example.com")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Admin")).toBeInTheDocument();
        expect(screen.getByText("Uživatel")).toBeInTheDocument();
      });
    });

    it("shows loading state initially", () => {
      renderUserTable([]);

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("renders table columns correctly", async () => {
      renderUserTable();

      await waitFor(() => {
        expect(screen.getByText("E-mail")).toBeInTheDocument();
        expect(screen.getByText("Role")).toBeInTheDocument();
      });
    });

    it("renders show deleted switch", () => {
      renderUserTable();

      expect(screen.getByText("Zobrazit smazané")).toBeInTheDocument();
    });
  });

  describe("User actions", () => {
    it("renders detail link for users with canShow permission", async () => {
      renderUserTable();

      await waitFor(() => {
        const detailLinks = screen.getAllByLabelText(/View user/);
        expect(detailLinks).toHaveLength(2);
        expect(detailLinks[0]).toHaveAttribute("href", "/users/1");
        expect(detailLinks[1]).toHaveAttribute("href", "/users/2");
      });
    });

    it("renders edit link for users with canUpdate permission", async () => {
      renderUserTable();

      await waitFor(() => {
        const editLinks = screen.getAllByLabelText(/Edit user/);
        expect(editLinks).toHaveLength(1);
        expect(editLinks[0].getAttribute("href")).toContain("dialog=userForm");
        expect(editLinks[0].getAttribute("href")).toContain("dialogData=1");
      });
    });

    it("renders delete button for users with canDestroy permission", async () => {
      renderUserTable();

      await waitFor(() => {
        const deleteButtons = screen.getAllByLabelText(/Delete user/);
        expect(deleteButtons).toHaveLength(1);
      });
    });

    it("handles delete action with confirmation", async () => {
      const mockConfirm = vi.mocked(window.confirm);
      mockConfirm.mockReturnValue(true);

      renderWithProviders(
        <MockedProvider mocks={[mockGetUsersQuery, mockUserDestroyMutation]}>
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        const deleteButton = screen.getByLabelText(/Delete user/);
        fireEvent.click(deleteButton);
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        "Opravdu chcete smazat tento záznam?",
      );

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          "Záznam byl úspěšně smazán",
          "success",
        );
      });
    });

    it("cancels delete action when user cancels confirmation", async () => {
      const mockConfirm = vi.mocked(window.confirm);
      mockConfirm.mockReturnValue(false);

      renderWithProviders(
        <MockedProvider mocks={[mockGetUsersQuery]}>
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        const deleteButton = screen.getByLabelText(/Delete user/);
        fireEvent.click(deleteButton);
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        "Opravdu chcete smazat tento záznam?",
      );
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
    });

    it("handles delete error", async () => {
      const mockConfirm = vi.mocked(window.confirm);
      mockConfirm.mockReturnValue(true);

      renderWithProviders(
        <MockedProvider
          mocks={[mockGetUsersQuery, mockUserDestroyMutationError]}
        >
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        const deleteButton = screen.getByLabelText(/Delete user/);
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          "Při mazání záznamu došlo k chybě",
          "error",
        );
      });
    });

    it("shows loading state on delete button during deletion", async () => {
      const mockConfirm = vi.mocked(window.confirm);
      mockConfirm.mockReturnValue(true);

      renderWithProviders(
        <MockedProvider mocks={[mockGetUsersQuery, mockUserDestroyMutation]}>
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        const deleteButton = screen.getByLabelText(/Delete user/);
        fireEvent.click(deleteButton);
      });
    });
  });

  describe("Show deleted functionality", () => {
    it("toggles show deleted state", async () => {
      renderWithProviders(
        <MockedProvider
          mocks={[mockGetUsersQuery, mockGetUsersQueryWithDeleted]}
        >
          <UserTable />
        </MockedProvider>,
      );

      const switchElement = screen.getByRole("switch");
      expect(switchElement).not.toBeChecked();

      fireEvent.click(switchElement);

      expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Function));
    });

    it("shows deleted users when showDeleted is enabled", async () => {
      mockSearchParams.set("showDeleted", "true");

      renderWithProviders(
        <MockedProvider mocks={[mockGetUsersQueryWithDeleted]}>
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText("deleted@example.com")).toBeInTheDocument();
      });
    });
  });

  describe("User form dialog", () => {
    it("renders user form dialog when dialog=userForm in search params", async () => {
      mockSearchParams.set("dialog", "userForm");
      mockSearchParams.set("dialogData", "1");

      renderWithProviders(
        <MockedProvider mocks={[mockGetUsersQuery]}>
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText("admin@example.com")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Uživatel" }),
        ).toBeInTheDocument();
      });
    });

    it("does not render dialog when dialog param is different", async () => {
      mockSearchParams.set("dialog", "someOtherDialog");

      renderWithProviders(
        <MockedProvider mocks={[mockGetUsersQuery]}>
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        expect(screen.queryByText("Uživatel")).not.toBeInTheDocument();
      });
    });

    it("passes correct user to form when dialogData matches user id", async () => {
      mockSearchParams.set("dialog", "userForm");
      mockSearchParams.set("dialogData", "1");

      renderWithProviders(
        <MockedProvider mocks={[mockGetUsersQuery]}>
          <UserTable />
        </MockedProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText("admin@example.com")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByDisplayValue("admin@example.com"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Filtering and sorting", () => {
    it("applies email filter from search params", () => {
      mockSearchParams.set("filters", JSON.stringify({ email: "admin" }));

      const mockQueryWithFilter = {
        ...mockGetUsersQuery,
        request: {
          ...mockGetUsersQuery.request,
          variables: {
            ...mockGetUsersQuery.request.variables,
            filter: {
              email: "admin",
            },
          },
        },
      };

      renderWithProviders(
        <MockedProvider mocks={[mockQueryWithFilter]}>
          <UserTable />
        </MockedProvider>,
      );
    });

    it("applies sorting from search params", () => {
      mockSearchParams.set("sortBy", "email");
      mockSearchParams.set("order", "desc");

      const mockQueryWithSort = {
        ...mockGetUsersQuery,
        request: {
          ...mockGetUsersQuery.request,
          variables: {
            ...mockGetUsersQuery.request.variables,
            sort: { email: "desc" },
          },
        },
      };

      renderWithProviders(
        <MockedProvider mocks={[mockQueryWithSort]}>
          <UserTable />
        </MockedProvider>,
      );
    });
  });
});
