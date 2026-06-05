import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGame, type GameInput } from "../api/client";
import { GameForm } from "../components/GameForm";

export function AddGamePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      navigate("/games");
    },
  });

  async function handleSubmit(game: GameInput) {
    await mutation.mutateAsync(game);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">Add Game</h1>
      <GameForm onSubmit={handleSubmit} submitLabel="Add Game" />
    </div>
  );
}
