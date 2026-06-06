import { Link, useSearchParams } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listGames,
  deleteGame,
  extractErrorMessage,
  type Game,
  type GamesListParams,
  type PaginationMeta,
} from "../api/client";
import { PLATFORMS, REGIONS, CONDITIONS } from "../api/enums";

const SORT_OPTIONS: {
  value: NonNullable<GamesListParams["sort"]>;
  label: string;
}[] = [
  { value: "created_at", label: "Date added" },
  { value: "title", label: "Title" },
  { value: "year", label: "Year" },
  { value: "platform", label: "Platform" },
];

const selectClass =
  "rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";

function paramsFromSearch(sp: URLSearchParams): GamesListParams {
  return {
    page: Number(sp.get("page") ?? "1") || 1,
    q: sp.get("q") ?? undefined,
    platform: sp.get("platform") ?? undefined,
    region: sp.get("region") ?? undefined,
    condition: sp.get("condition") ?? undefined,
    sort: (sp.get("sort") as GamesListParams["sort"]) ?? undefined,
    dir: (sp.get("dir") as GamesListParams["dir"]) ?? undefined,
  };
}

function buildSearch(params: GamesListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.page && params.page > 1) out.page = String(params.page);
  if (params.q) out.q = params.q;
  if (params.platform) out.platform = params.platform;
  if (params.region) out.region = params.region;
  if (params.condition) out.condition = params.condition;
  if (params.sort) out.sort = params.sort;
  if (params.dir) out.dir = params.dir;
  return out;
}

export function GamesPage() {
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const params = paramsFromSearch(searchParams);
  const page = params.page ?? 1;

  // Debounced search input — local state drives the input, URL updated after delay
  const [searchInput, setSearchInput] = useState(params.q ?? "");

  const updateParams = useCallback(
    (updates: Partial<GamesListParams>) => {
      const next = buildSearch({ ...params, ...updates, page: 1 });
      setSearchParams(next, { replace: true });
    },
    [params, setSearchParams],
  );

  // Debounce: push q to URL 400ms after user stops typing
  // Only update when value actually differs from current URL to avoid resetting page on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (params.q ?? "")) {
        updateParams({ q: searchInput || undefined });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["games", "list", params],
    queryFn: () => listGames(params),
  });

  const games: Game[] = data?.data ?? [];
  const pagination: PaginationMeta | undefined = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games", "list"] });
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

  const hasFilters = !!(
    params.q ||
    params.platform ||
    params.region ||
    params.condition
  );

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

      {/* Search + filters + sort */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Search */}
        <input
          type="search"
          placeholder="Search by title…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />

        {/* Filters + sort row */}
        <div className="flex flex-wrap gap-2">
          <select
            value={params.platform ?? ""}
            onChange={(e) =>
              updateParams({ platform: e.target.value || undefined })
            }
            className={selectClass}
          >
            <option value="">All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={params.region ?? ""}
            onChange={(e) =>
              updateParams({ region: e.target.value || undefined })
            }
            className={selectClass}
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={params.condition ?? ""}
            onChange={(e) =>
              updateParams({ condition: e.target.value || undefined })
            }
            className={selectClass}
          >
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort */}
          <select
            value={params.sort ?? "created_at"}
            onChange={(e) =>
              updateParams({ sort: e.target.value as GamesListParams["sort"] })
            }
            className={selectClass}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              updateParams({ dir: params.dir === "asc" ? "desc" : "asc" })
            }
            title={params.dir === "asc" ? "Ascending" : "Descending"}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            {params.dir === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>

          {hasFilters && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearchParams({}, { replace: true });
              }}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              Clear filters
            </button>
          )}
        </div>
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

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-slate-400">Loading…</div>
        </div>
      ) : games.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          {hasFilters ? (
            <p className="text-lg">No games match your filters</p>
          ) : (
            <>
              <p className="mb-2 text-lg">No games yet</p>
              <p className="text-sm">
                <Link
                  to="/games/new"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Add your first game
                </Link>
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-50" : ""}`}
          >
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onDelete={handleDelete}
                isDeleting={
                  deleteMutation.isPending &&
                  deleteMutation.variables === game.id
                }
              />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  setSearchParams(buildSearch({ ...params, page: page - 1 }), {
                    replace: true,
                  })
                }
                disabled={page === 1}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-400">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() =>
                  setSearchParams(buildSearch({ ...params, page: page + 1 }), {
                    replace: true,
                  })
                }
                disabled={page === pagination.pages}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
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
