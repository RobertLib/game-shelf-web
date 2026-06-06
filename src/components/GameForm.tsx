import { useState } from "react";
import { extractErrorMessage, type GameInput } from "../api/client";

type Props = {
  initial?: Partial<GameInput>;
  onSubmit: (game: GameInput) => Promise<void>;
  submitLabel: string;
};

const inputClass =
  "w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

const labelClass = "block text-sm font-medium text-slate-300 mb-1";

export function GameForm({ initial = {}, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<GameInput>({
    title: initial.title ?? "",
    platform: initial.platform ?? "",
    year: initial.year ?? new Date().getFullYear(),
    genre: initial.genre ?? "",
    developer: initial.developer ?? "",
    publisher: initial.publisher ?? "",
    region: initial.region ?? "",
    condition: initial.condition ?? "",
    notes: initial.notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "year" ? Number(value) : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className={labelClass}>
            Title *
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="The Legend of Zelda"
          />
        </div>
        <div>
          <label htmlFor="platform" className={labelClass}>
            Platform *
          </label>
          <input
            id="platform"
            name="platform"
            value={form.platform}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="NES"
          />
        </div>
        <div>
          <label htmlFor="year" className={labelClass}>
            Year *
          </label>
          <input
            id="year"
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            required
            min={1950}
            max={new Date().getFullYear() + 2}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="genre" className={labelClass}>
            Genre *
          </label>
          <input
            id="genre"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Action-adventure"
          />
        </div>
        <div>
          <label htmlFor="developer" className={labelClass}>
            Developer *
          </label>
          <input
            id="developer"
            name="developer"
            value={form.developer}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Nintendo"
          />
        </div>
        <div>
          <label htmlFor="publisher" className={labelClass}>
            Publisher
          </label>
          <input
            id="publisher"
            name="publisher"
            value={form.publisher ?? ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
        <div>
          <label htmlFor="region" className={labelClass}>
            Region
          </label>
          <input
            id="region"
            name="region"
            value={form.region ?? ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="EUR / USA / JPN…"
          />
        </div>
        <div>
          <label htmlFor="condition" className={labelClass}>
            Condition
          </label>
          <input
            id="condition"
            name="condition"
            value={form.condition ?? ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="Mint / Good / Fair…"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes ?? ""}
          onChange={handleChange}
          rows={3}
          className={inputClass}
          placeholder="Any additional notes…"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
