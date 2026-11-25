import AccountCard from './AccountCard';
import Spinner from './Spinner';
import type { Account, GameSlug, Pagination } from '../types';

interface Props {
  items: Account[];
  game: GameSlug;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  page: number;
  perPage: number;
  onPage: (p: number) => void;
  onOpen: (a: Account) => void;
}

export default function AccountGrid({ items, game, loading, error, pagination, page, perPage, onPage, onOpen }: Props) {
  const hasNext =
    pagination.hasMore ??
    (pagination.totalPages
      ? page < pagination.totalPages
      : pagination.total
        ? page * perPage < pagination.total
        : items.length >= perPage);

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
        Não foi possível carregar as contas. {error}
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-zinc-400">
        <Spinner className="h-6 w-6" /> Carregando contas…
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center text-zinc-400">
        Nenhuma conta encontrada. Ajuste a faixa de preço ou escolha outro jogo.
      </div>
    );
  }

  return (
    <div className={loading ? 'opacity-60 transition' : 'transition'}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((acc) => (
          <AccountCard key={String(acc.id)} account={acc} game={game} onOpen={onOpen} />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="text-sm text-zinc-400">Página {page}</span>
        <button
          type="button"
          disabled={!hasNext || loading}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
