import { gameEmoji } from '../lib/games';
import { formatBRL, getAccountMeta } from '../lib/format';
import type { Account, GameSlug } from '../types';

interface Props {
  account: Account;
  game: GameSlug;
  onOpen: (a: Account) => void;
}

export default function AccountCard({ account, game, onOpen }: Props) {
  const { title, image, tags } = getAccountMeta(account);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition hover:border-brand/70">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-brand/25 via-card to-bg">
        {image ? (
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-80" aria-hidden="true">
            {gameEmoji(game)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">{title}</h3>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li key={t} className="rounded-md border border-line bg-bg px-2 py-1 text-xs text-zinc-300">
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="text-xl font-extrabold text-white">{formatBRL(account.price)}</p>
          <button
            type="button"
            onClick={() => onOpen(account)}
            className="rounded-lg bg-pix px-4 py-2 text-sm font-bold text-white transition hover:bg-pix-dark"
          >
            Ver conta
          </button>
        </div>
      </div>
    </article>
  );
}
