import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
      <Link
        to="/games"
        className="text-xl font-bold tracking-tight text-indigo-400"
      >
        Game Shelf
      </Link>
      {isAuthenticated && (
        <div className="flex items-center gap-6">
          <Link
            to="/games"
            className="text-sm text-slate-300 transition-colors hover:text-white"
          >
            My Collection
          </Link>
          <Link
            to="/games/new"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-500"
          >
            + Add Game
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
