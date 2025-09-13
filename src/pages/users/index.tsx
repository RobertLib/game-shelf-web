import { Breadcrumbs, Header } from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { Link, useSearchParams } from "react-router";
import { Plus, Users } from "lucide-react";
import { use } from "react";
import SessionContext from "../../contexts/session-context";
import UserTable from "./user-table";

export default function UsersPage() {
  const [searchParams] = useSearchParams();

  const dict = getDictionary();

  const { authorization } = use(SessionContext);

  return (
    <div className="p-4">
      <Breadcrumbs
        className="mb-2"
        items={[{ href: "/users", label: dict.users.title }]}
      />

      <Header
        actions={
          authorization?.canCreateUser?.value && (
            <Link
              className="btn"
              to={`/users?${new URLSearchParams(
                Object.fromEntries([
                  ...searchParams.entries(),
                  ["dialog", "userForm"],
                ]),
              )}`}
            >
              <Plus size={18} />
              {dict.actions.new}
            </Link>
          )
        }
        className="mb-3"
        title={
          <div className="flex items-center">
            <Users size={24} className="mr-2.5" />
            {dict.users.title}
          </div>
        }
      />

      <UserTable />
    </div>
  );
}
