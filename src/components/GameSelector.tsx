import { GAMES } from '../lib/games';
import type { GameSlug } from '../types';

interface Props {
  value: GameSlug;
  onChange: (game: GameSlug) => void;
}

export default function GameSelector({ value, onChange }: Props) {
  return (
    <nav aria-label="Escolha o jogo" className="-mx-4 overflow-x-auto px-4 py-4">
      <ul className="flex min-w-max gap-2">
        {GAMES.map((g) => {
          const active = g.slug === value;
          return (
            <li key={g.slug}>
              <button
                type="button"
                onClick={() => onChange(g.slug)}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'border-brand bg-brand/15 text-white shadow-glow'
                    : 'border-line bg-card text-zinc-400 hover:border-brand/60 hover:text-white'
                }`}
              >
                <span className="text-base" aria-hidden="true">{g.emoji}</span>
                {g.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
