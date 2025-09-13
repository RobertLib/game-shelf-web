import { Drawer, Navbar } from "../components/ui";
import { getDictionary } from "../dictionaries";
import { Outlet } from "react-router";
import { use } from "react";
import { Users } from "lucide-react";
import SessionContext from "../contexts/session-context";

export default function Layout() {
  const { authorization, isLoading } = use(SessionContext);

  const dict = getDictionary();

  return (
    <>
      <Drawer
        isLoading={isLoading || !authorization}
        items={[
          authorization?.canIndexUsers?.value
            ? {
                href: "/users",
                icon: <Users size={18} />,
                label: dict.users.title,
              }
            : null,
        ].filter((item) => item !== null)}
      />
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
