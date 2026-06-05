import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getGame, updateGame, type Game, type GameInput } from '../api/client';
import { GameForm } from '../components/GameForm';

export function EditGamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getGame(Number(id))
      .then(setGame)
      .catch(() => setError('Game not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(gameInput: GameInput) {
    await updateGame(Number(id), gameInput);
    navigate('/games');
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Loading…</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-red-400">{error ?? 'Game not found.'}</p>
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
