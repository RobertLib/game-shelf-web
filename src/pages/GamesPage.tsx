import { Link } from "react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listGames,
  deleteGame,
  extractErrorMessage,
  type Game,
} from "../api/client";

export function GamesPage() {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: games = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["games"],
    queryFn: listGames,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGame,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Game[]>(["games"], (prev) =>
        prev?.filter((g) => g.id !== id),
      );
      setDeleteError(null);
    },
    onError: (err) => {
      setDeleteError(extractErrorMessage(err));
    },
  });

  function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleteError(null);
    deleteMutation.mutate(id);
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">My Collection</h1>
        <Link
          to="/games/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          + Add Game
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 text-sm text-red-300">
          Failed to load games.
        </div>
      )}

      {deleteError && (
        <div className="mb-6 rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 text-sm text-red-300">
          {deleteError}
        </div>
      )}

      {games.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <p className="mb-2 text-lg">No games yet</p>
          <p className="text-sm">
            <Link
              to="/games/new"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Add your first game
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onDelete={handleDelete}
              isDeleting={
                deleteMutation.isPending && deleteMutation.variables === game.id
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GameCard({
  game,
  onDelete,
  isDeleting,
}: {
  game: Game;
  onDelete: (id: number, title: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div>
        <h2 className="text-base leading-tight font-semibold text-slate-100">
          {game.title}
        </h2>
        <p className="mt-0.5 text-sm text-slate-400">
          {game.platform} · {game.year}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {game.genre && (
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            {game.genre}
          </span>
        )}
        {game.region && (
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            {game.region}
          </span>
        )}
        {game.condition && (
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            {game.condition}
          </span>
        )}
      </div>

      <div className="mt-auto flex gap-2 pt-1">
        <Link
          to={`/games/${game.id}/edit`}
          className="flex-1 rounded-lg bg-slate-700 py-1.5 text-center text-sm text-slate-200 transition-colors hover:bg-slate-600"
        >
          Edit
        </Link>
        <button
          onClick={() => onDelete(game.id, game.title)}
          disabled={isDeleting}
          className="flex-1 rounded-lg bg-slate-700 py-1.5 text-sm text-slate-200 transition-colors hover:bg-red-900/60 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
