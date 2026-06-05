import { useNavigate, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGame, updateGame, type GameInput } from '../api/client';
import { GameForm } from '../components/GameForm';

export function EditGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['games', Number(id)],
    queryFn: () => getGame(Number(id)),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (gameInput: GameInput) => updateGame(Number(id), gameInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      navigate('/games');
    },
  });

  async function handleSubmit(gameInput: GameInput) {
    await mutation.mutateAsync(gameInput);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Loading…</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-red-400">Game not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Edit "{game.title}"</h1>
      <GameForm
        initial={{
          title: game.title,
          platform: game.platform,
          year: game.year,
          genre: game.genre,
          developer: game.developer,
          publisher: game.publisher ?? '',
          region: game.region ?? '',
          condition: game.condition ?? '',
          notes: game.notes ?? '',
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
