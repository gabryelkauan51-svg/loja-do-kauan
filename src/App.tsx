import { useCallback, useState } from 'react';
import Header from './components/Header';
import GameSelector from './components/GameSelector';
import FiltersSidebar, { type Filters } from './components/FiltersSidebar';
import AccountGrid from './components/AccountGrid';
import AccountModal from './components/AccountModal';
import CheckoutModal from './components/CheckoutModal';
import { useCatalog } from './hooks/useCatalog';
import { GAMES } from './lib/games';
import { checkoutPrice, formatBRL } from './lib/format';
import type { Account, CheckoutResponse, GameSlug } from './types';

const PER_PAGE = 24;
const PENDING_KEY = 'lf_pending_order';

function loadPending(): CheckoutResponse | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as CheckoutResponse) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [game, setGame] = useState<GameSlug>('valorant');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ priceFrom: '', priceTo: '', order: '' });
  const [selected, setSelected] = useState<Account | null>(null);
  const [buying, setBuying] = useState<Account | null>(null);
  const [pending, setPending] = useState<CheckoutResponse | null>(loadPending);
  const [resuming, setResuming] = useState(false);

  const { items, pagination, loading, error } = useCatalog({
    game,
    page,
    perPage: PER_PAGE,
    priceFrom: filters.priceFrom || undefined,
    priceTo: filters.priceTo || undefined,
    order: filters.order || undefined,
  });

  const savePending = useCallback((c: CheckoutResponse) => {
    setPending(c);
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(c));
    } catch {
      /* armazenamento indisponível */
    }
  }, []);

  const clearPending = useCallback(() => {
    setPending(null);
    try {
      localStorage.removeItem(PENDING_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const closeCheckout = useCallback(() => {
    setBuying(null);
    setResuming(false);
  }, []);

  const checkoutOpen = buying !== null || resuming;
  const gameLabel = GAMES.find((g) => g.slug === game)?.label ?? game;

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-28">
        <GameSelector
          value={game}
          onChange={(g) => {
            setGame(g);
            setPage(1);
          }}
        />

        <h1 className="mb-5 text-2xl font-extrabold tracking-tight">Contas de {gameLabel}</h1>

        <div className="flex flex-col gap-6 lg:flex-row">
          <FiltersSidebar
            value={filters}
            onApply={(f) => {
              setFilters(f);
              setPage(1);
            }}
          />

          <section className="min-w-0 flex-1" aria-live="polite">
            <AccountGrid
              items={items}
              game={game}
              loading={loading}
              error={error}
              pagination={pagination}
              page={page}
              perPage={PER_PAGE}
              onPage={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpen={setSelected}
            />
          </section>
        </div>
      </main>

      {selected && !checkoutOpen && (
        <AccountModal
          account={selected}
          game={game}
          onClose={() => setSelected(null)}
          onBuy={(a) => {
            setSelected(null);
            setBuying(a);
          }}
        />
      )}

      {buying && (
        <CheckoutModal
          account={buying}
          game={game}
          onCreated={savePending}
          onFinish={clearPending}
          onClose={closeCheckout}
        />
      )}

      {resuming && pending && (
        <CheckoutModal
          resume={pending}
          game={pending.game}
          onCreated={savePending}
          onFinish={clearPending}
          onClose={closeCheckout}
        />
      )}

      {pending && !checkoutOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand/40 bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center">
            <p className="text-sm text-zinc-200">
              Você tem um pedido PIX em andamento
              {checkoutPrice(pending) !== null && (
                <>
                  {' '}
                  de <strong className="font-extrabold text-white">{formatBRL(checkoutPrice(pending))}</strong>
                </>
              )}
              .
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResuming(true)}
                className="rounded-lg bg-pix px-4 py-2 text-sm font-bold text-white transition hover:bg-pix-dark"
              >
                Retomar pedido
              </button>
              <button
                type="button"
                onClick={clearPending}
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-brand hover:text-white"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
