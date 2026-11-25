import { useEffect, useState } from 'react';
import { fetchCatalog } from '../lib/api';
import type { Account, CatalogParams, Pagination } from '../types';

interface State {
  items: Account[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

export function useCatalog(params: CatalogParams): State {
  const [state, setState] = useState<State>({ items: [], pagination: {}, loading: true, error: null });
  const key = JSON.stringify(params);

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchCatalog(params, ctrl.signal)
      .then((res) =>
        setState({ items: res.items ?? [], pagination: res.pagination ?? {}, loading: false, error: null }),
      )
      .catch((e: Error) => {
        if (ctrl.signal.aborted) return;
        setState({ items: [], pagination: {}, loading: false, error: e.message });
      });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
