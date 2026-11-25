import { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import { fetchAccountDetails } from '../lib/api';
import { formatBRL, getAccountMeta, humanize } from '../lib/format';
import type { Account, GameSlug, Skin } from '../types';

interface Props {
  account: Account;
  game: GameSlug;
  onClose: () => void;
  onBuy: (a: Account) => void;
}

const HIDDEN_KEYS = new Set([
  'id', 'price', 'title', 'name', 'description', 'desc', 'details', 'image', 'imageUrl', 'image_url',
  'images', 'thumbnail', 'thumb', 'cover', 'picture', 'tags', 'skins',
]);

function skinInfo(s: Skin): { name: string; image: string | null; sub: string | null } {
  if (typeof s === 'string') return { name: s, image: null, sub: null };
  const pickStr = (keys: string[]) => {
    for (const k of keys) {
      const v = s[k];
      if (typeof v === 'string' && v.trim()) return v;
    }
    return null;
  };
  return {
    name: pickStr(['name', 'title', 'displayName', 'display_name']) ?? 'Skin',
    image: pickStr(['image', 'imageUrl', 'image_url', 'icon', 'iconUrl', 'thumbnail']),
    sub: pickStr(['rarity', 'tier', 'type', 'weapon', 'champion', 'agent']),
  };
}

export default function AccountModal({ account, game, onClose, onBuy }: Props) {
  const [detail, setDetail] = useState<Account>(account);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const acc = account as Record<string, unknown>;
const accountId = acc.item_id ?? acc.itemId ?? acc.id;

if (!accountId) {
  setLoading(false);
  return;
}
   fetchAccountDetails(String(accountId), game, ctrl.signal)
      .then((res) => {
        setDetail({ ...account, ...res.account });
        setSkins(res.skins ?? []);
        setError(null);
      })
      .catch((e: Error) => {
        if (!ctrl.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [account, game]);

  const meta = getAccountMeta(detail);

  const facts = useMemo(
    () =>
      Object.entries(detail)
        .filter(([k, v]) => !HIDDEN_KEYS.has(k) && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'))
        .slice(0, 12),
    [detail],
  );

  const shownSkins = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = skins.map(skinInfo);
    return q ? list.filter((s) => s.name.toLowerCase().includes(q)) : list;
  }, [skins, query]);

  return (
    <Modal onClose={onClose} wide label={`Detalhes de ${meta.title}`}>
      {meta.image && (
        <div className="aspect-[16/7] w-full overflow-hidden bg-bg">
          <img src={meta.image} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="space-y-6 p-6">
        <header className="pr-10">
          <h2 className="text-xl font-extrabold leading-snug">{meta.title}</h2>
          {meta.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {meta.tags.map((t) => (
                <li key={t} className="rounded-md border border-line bg-bg px-2 py-1 text-xs text-zinc-300">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </header>

        {meta.description && <p className="max-w-prose text-sm leading-relaxed text-zinc-300">{meta.description}</p>}

        {facts.length > 0 && (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="rounded-lg border border-line bg-bg p-3">
                <dt className="text-xs text-zinc-500">{humanize(k)}</dt>
                <dd className="mt-0.5 truncate text-sm font-semibold text-white">{String(v)}</dd>
              </div>
            ))}
          </dl>
        )}

        <section aria-labelledby="skins-title">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 id="skins-title" className="text-base font-bold">
              Skins da conta {!loading && <span className="text-zinc-500">({skins.length})</span>}
            </h3>
            {skins.length > 12 && (
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar skin"
                aria-label="Buscar skin"
                className="w-40 rounded-lg border border-line bg-bg px-3 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:border-brand focus:outline-none"
              />
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-zinc-400">
              <Spinner /> Carregando inventário…
            </div>
          ) : error ? (
            <p role="alert" className="text-sm text-red-300">
              Não foi possível carregar todos os detalhes. {error}
            </p>
          ) : shownSkins.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {skins.length === 0 ? 'Esta conta não tem skins listadas.' : 'Nenhuma skin com esse nome.'}
            </p>
          ) : (
            <ul className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {shownSkins.map((s, i) => (
                <li key={`${s.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-line bg-bg p-2">
                  {s.image ? (
                    <img src={s.image} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brand/20 text-sm" aria-hidden="true">
                      🎨
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-white">{s.name}</span>
                    {s.sub && <span className="block truncate text-xs text-zinc-500">{s.sub}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-extrabold">{formatBRL(detail.price)}</p>
          <button
            type="button"
            onClick={() => onBuy(detail)}
            className="rounded-xl bg-pix px-6 py-3 text-base font-bold text-white transition hover:bg-pix-dark"
          >
            Comprar via PIX
          </button>
        </footer>
      </div>
    </Modal>
  );
}
