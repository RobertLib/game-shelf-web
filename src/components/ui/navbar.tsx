import { getDictionary } from "../../dictionaries";
// import { Link } from "react-router";
import { Loader, Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import { use } from "react";
import Avatar from "./avatar";
import cn from "../../utils/cn";
import DrawerContext from "../../contexts/drawer-context";
import Dropdown from "./dropdown";
import IconButton from "./icon-button";
import SessionContext from "../../contexts/session-context";
import useIsMobile from "../../hooks/use-is-mobile";

type NavbarProps = React.ComponentProps<"nav">;

export default function Navbar({ className, ...props }: NavbarProps) {
  const { isCollapsed, toggleCollapsed, toggleOpen } = use(DrawerContext);
  const { currentUser, isLoading, logout } = use(SessionContext);
  const isMobile = useIsMobile();

  const dict = getDictionary();

  return (
    <header className="navbar bg-surface sticky top-0 z-20">
      <nav
        aria-label="Main navigation"
        {...props}
        className={cn(
          "flex items-center justify-between border-b border-neutral-100 px-4 py-3",
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <IconButton
            aria-label={isMobile ? "Toggle menu" : "Toggle collapsed menu"}
            onClick={isMobile ? toggleOpen : toggleCollapsed}
          >
            {isMobile ? (
              <Menu size={20} />
            ) : isCollapsed ? (
              <PanelLeft size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </IconButton>
          {/* <Link className="link font-medium" to="/">
            GameShelf
          </Link> */}
        </div>
        {isLoading ? (
          <Loader className="animate-spin text-neutral-500" size={20} />
        ) : (
          <div className="flex items-center gap-2.5">
            <Avatar />
            <Dropdown
              items={[{ label: dict.auth.logout, onClick: logout }]}
              trigger={currentUser?.email}
            />
          </div>
        )}
      </nav>
    </header>
  );
}
