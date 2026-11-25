import type {
  AccountDetailsResponse,
  CatalogParams,
  CatalogResponse,
  CheckoutResponse,
  GameSlug,
  OrderStatusResponse,
} from '../types';

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

type Query = Record<string, string | number | undefined | null>;

async function call<T>(
  fn: string,
  opts: { method?: 'GET' | 'POST'; query?: Query; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const { method = 'GET', query, body, signal } = opts;

  if (!import.meta.env.VITE_SUPABASE_URL || !KEY) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.');
  }

  const url = new URL(`${BASE}/${fn}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method,
    signal,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* resposta sem JSON */
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Erro ${res.status}. Tente novamente.`);
  }
  return data as T;
}

export function fetchCatalog(params: CatalogParams, signal?: AbortSignal) {
  return call<CatalogResponse>('catalog', {
    query: {
      game: params.game,
      page: params.page,
      perPage: params.perPage,
      priceFrom: params.priceFrom,
      priceTo: params.priceTo,
      order: params.order,
    },
    signal,
  });
}

export function fetchAccountDetails(id: string | number, game: GameSlug, signal?: AbortSignal) {
  return call<AccountDetailsResponse>('account-details', { query: { id: String(id), game }, signal });
}

export function createCheckout(accountId: string | number, game: GameSlug) {
  return call<CheckoutResponse>('create-checkout', {
    method: 'POST',
    body: { accountId: String(accountId), game },
  });
}

export function fetchOrderStatus(order: { orderId?: string | null; externalRef?: string | null }) {
  return call<OrderStatusResponse>('check-order', {
    query: { orderId: order.orderId ?? undefined, externalRef: order.externalRef ?? undefined },
  });
}
