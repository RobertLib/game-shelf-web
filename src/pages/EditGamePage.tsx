import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGame, updateGame, type GameInput } from "../api/client";
import { GameForm } from "../components/GameForm";

export function EditGamePage() {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: game,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["games", numericId],
    queryFn: () => getGame(numericId!),
    enabled: numericId !== null,
  });

  const mutation = useMutation({
    mutationFn: (gameInput: GameInput) => updateGame(numericId!, gameInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      navigate("/games");
    },
  });

  async function handleSubmit(gameInput: GameInput) {
    await mutation.mutateAsync(gameInput);
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-400">Loading…</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-red-400">Game not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">
        Edit "{game.title}"
      </h1>
      <GameForm
        initial={{
          title: game.title,
          platform: game.platform,
          year: game.year,
          genre: game.genre,
          developer: game.developer,
          publisher: game.publisher ?? "",
          region: game.region ?? "",
          condition: game.condition ?? "",
          notes: game.notes ?? "",
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
