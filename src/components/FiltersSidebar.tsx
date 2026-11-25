import { useEffect, useState, type FormEvent } from 'react';
import type { Order } from '../types';

export interface Filters {
  priceFrom: string;
  priceTo: string;
  order: Order;
}

interface Props {
  value: Filters;
  onApply: (f: Filters) => void;
}

const inputCls =
  'w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-brand focus:outline-none';

export default function FiltersSidebar({ value, onApply }: Props) {
  const [draft, setDraft] = useState<Filters>(value);

  useEffect(() => setDraft(value), [value]);

  const apply = (e: FormEvent) => {
    e.preventDefault();
    onApply(draft);
  };

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64 lg:self-start">
      <form onSubmit={apply} className="space-y-5 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-base font-bold">Filtros</h2>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-zinc-300">Faixa de preço (R$)</legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="Mínimo"
              aria-label="Preço mínimo"
              value={draft.priceFrom}
              onChange={(e) => setDraft({ ...draft, priceFrom: e.target.value })}
              className={inputCls}
            />
            <span className="text-zinc-600">–</span>
            <input
              type="number"
              min={0}
              inputMode="decimal"
              placeholder="Máximo"
              aria-label="Preço máximo"
              value={draft.priceTo}
              onChange={(e) => setDraft({ ...draft, priceTo: e.target.value })}
              className={inputCls}
            />
          </div>
        </fieldset>

        <div>
          <label htmlFor="order" className="mb-2 block text-sm font-semibold text-zinc-300">
            Ordenar por
          </label>
          <select
            id="order"
            value={draft.order}
            onChange={(e) => setDraft({ ...draft, order: e.target.value as Order })}
            className={inputCls}
          >
            <option value="">Padrão</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-light"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => onApply({ priceFrom: '', priceTo: '', order: '' })}
            className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-brand hover:text-white"
          >
            Limpar
          </button>
        </div>
      </form>
    </aside>
  );
}
