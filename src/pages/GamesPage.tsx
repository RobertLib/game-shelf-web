import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { listGames, deleteGame, type Game } from '../api/client';

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listGames()
      .then((data) => { if (!cancelled) setGames(data); })
      .catch(() => { if (!cancelled) setError('Failed to load games.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteGame(id);
      setGames((prev) => prev.filter((g) => g.id !== id));
    } catch {
      alert('Failed to delete game.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">My Collection</h1>
        <Link
          to="/games/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Game
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-sm text-red-300 mb-6">
          {error}
        </div>
      )}

      {games.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">No games yet</p>
          <p className="text-sm">
            <Link to="/games/new" className="text-indigo-400 hover:text-indigo-300">
              Add your first game
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function GameCard({
  game,
  onDelete,
}: {
  game: Game;
  onDelete: (id: number, title: string) => void;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-100 leading-tight">{game.title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {game.platform} · {game.year}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {game.genre && (
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            {game.genre}
          </span>
        )}
        {game.region && (
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            {game.region}
          </span>
        )}
        {game.condition && (
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            {game.condition}
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-auto pt-1">
        <Link
          to={`/games/${game.id}/edit`}
          className="flex-1 text-center text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg py-1.5 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(game.id, game.title)}
          className="flex-1 text-sm bg-slate-700 hover:bg-red-900/60 text-slate-200 hover:text-red-300 rounded-lg py-1.5 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
