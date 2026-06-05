import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <Link to="/games" className="text-xl font-bold text-indigo-400 tracking-tight">
        Game Shelf
      </Link>
      {isAuthenticated && (
        <div className="flex items-center gap-6">
          <Link
            to="/games"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            My Collection
          </Link>
          <Link
            to="/games/new"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md transition-colors"
          >
            + Add Game
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
