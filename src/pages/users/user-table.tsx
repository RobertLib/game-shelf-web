import { Edit, Search, Trash } from "lucide-react";
import { GET_USERS_TABLE } from "../../graphql/queries/users";
import { getDictionary } from "../../dictionaries";
import {
  getTableParams,
  resetTableParams,
} from "../../components/ui/data-table/table-params";
import {
  Chip,
  DataTable,
  Dialog,
  IconButton,
  Switch,
  Tooltip,
} from "../../components/ui";
import { Link, useSearchParams } from "react-router";
import { use, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { USER_DESTROY } from "../../graphql/mutations/users";
import { UserRole, type User } from "../../__generated__/graphql";
import SnackbarContext from "../../contexts/snackbar-context";
import UserForm from "./user-form";

export default function UserTable() {
  const dict = getDictionary();

  const { enqueueSnackbar } = use(SnackbarContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const { after, before, first, last, sortBy, order, filters, showDeleted } =
    getTableParams(searchParams);

  const {
    data: usersData,
    error: usersError,
    loading,
    refetch,
  } = useQuery(GET_USERS_TABLE, {
    fetchPolicy: "cache-and-network",
    variables: {
      after,
      before,
      first,
      last,
      ...(sortBy ? { sort: { [sortBy]: order } } : {}),
      filter: {
        email: filters.email,
        ...(showDeleted && {}),
      },
    },
  });

  const { nodes: users, pageInfo, totalCount } = usersData?.users ?? {};

  useEffect(() => {
    if (usersError) {
      enqueueSnackbar(dict.errors.fetchingData, "error");
    }
  }, [dict, enqueueSnackbar, usersError]);

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const [deleteUser] = useMutation(USER_DESTROY);

  return (
    <>
      <DataTable
        actions={(row) => (
          <div className="flex gap-2">
            {row.canShow.value && (
              <Tooltip title={dict.actions.detail}>
                <Link
                  aria-label={`View user ${row.email}`}
                  className="icon-btn"
                  to={`/users/${row.id}`}
                >
                  <Search color="var(--color-primary-500)" size={18} />
                </Link>
              </Tooltip>
            )}

            {row.canUpdate.value && (
              <Tooltip title={dict.actions.edit}>
                <Link
                  aria-label={`Edit user ${row.email}`}
                  className="icon-btn"
                  to={`/users?${new URLSearchParams(
                    Object.fromEntries([
                      ...searchParams.entries(),
                      ["dialog", "userForm"],
                      ["dialogData", row.id],
                    ]),
                  )}`}
                >
                  <Edit color="var(--color-warning-500)" size={18} />
                </Link>
              </Tooltip>
            )}

            {row.canDestroy.value && !showDeleted && (
              <Tooltip title={dict.actions.delete}>
                <IconButton
                  aria-label={`Delete user ${row.email}`}
                  loading={deletingUserId === row.id}
                  onClick={async () => {
                    if (confirm(dict.actions.deleteConfirm)) {
                      try {
                        setDeletingUserId(row.id);
                        await deleteUser({
                          variables: { input: { id: row.id } },
                        });
                        enqueueSnackbar(dict.actions.deleteSuccess, "success");
                        refetch();
                      } catch {
                        enqueueSnackbar(dict.actions.deleteError, "error");
                      } finally {
                        setDeletingUserId(null);
                      }
                    }
                  }}
                >
                  <Trash color="var(--color-danger-500)" size={18} />
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
        columns={[
          {
            filter: "input",
            key: "email",
            label: dict.user.email,
            sortable: true,
          },
          {
            filter: "select",
            filterSelectOptions: Object.values(UserRole).map((value) => ({
              label: dict.userRole[value as UserRole],
              value,
            })),
            key: "role",
            label: dict.user.role,
            render: (row) => <Chip>{dict.userRole[row.role]}</Chip>,
            sortable: true,
          },
        ]}
        data={users?.filter((user): user is User => !!user) ?? []}
        loading={loading}
        pageInfo={pageInfo}
        tableId="admin-users"
        toolbar={
          <Switch
            defaultChecked={showDeleted}
            label={dict.actions.showDeleted}
            onChange={() => {
              setSearchParams((prev) => {
                prev.set("showDeleted", showDeleted ? "false" : "true");
                resetTableParams(prev);
                return prev;
              });
            }}
          />
        }
        total={totalCount}
      />

      {searchParams.get("dialog") === "userForm" && !loading && (
        <Dialog title={dict.user.title}>
          <UserForm
            onSuccess={() => {
              refetch();
            }}
            user={users?.find(
              (user): user is User =>
                user?.id === searchParams.get("dialogData"),
            )}
          />
        </Dialog>
      )}
    </>
  );
}
