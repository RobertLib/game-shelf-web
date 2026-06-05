import { useNavigate } from 'react-router';
import { createGame, type GameInput } from '../api/client';
import { GameForm } from '../components/GameForm';

export function AddGamePage() {
  const navigate = useNavigate();

  async function handleSubmit(game: GameInput) {
    await createGame(game);
    navigate('/games');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Add Game</h1>
      <GameForm onSubmit={handleSubmit} submitLabel="Add Game" />
    </div>
  );
}
