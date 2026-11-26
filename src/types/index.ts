export type GameSlug =
  | 'valorant'
  | 'fortnite'
  | 'steam'
  | 'roblox'
  | 'league-of-legends'
  | 'clash-royale'
  | 'genshin-impact'
  | 'brawl-stars'
  | 'rocket-league'
  | 'epic-games'
  | 'ea'
  | 'ubisoft';

export type Account = { id: string | number; price: number | null } & Record<string, unknown>;

export interface Pagination {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
}

export type Order = 'price_asc' | 'price_desc' | '';

export interface CatalogParams {
  game: GameSlug;
  page: number;
  perPage: number;
  priceFrom?: string;
  priceTo?: string;
  order?: Order;
}

export interface CatalogResponse {
  game: GameSlug;
  items: Account[];
  pagination?: Pagination;
}

export type Skin = string | Record<string, unknown>;

export interface AccountDetailsResponse {
  account: Account;
  skins: Skin[];
}

export interface CheckoutResponse {
  orderId: string | null;
  externalRef: string;
  accountId: string;
  game: GameSlug;
  displayPrice: number | null;
  chargedAmount: number | null;
  /**
   * Valor final com margem, resolvido no front ao criar o pedido
   * (displayPrice → preço do catálogo → chargedAmount). Salvo junto do pedido.
   */
  finalPrice?: number | null;
  qrCodeImage: string | null;
  copyPaste: string | null;
  expiresAt: string | null;
}

export type Credentials = string | Record<string, unknown> | null;

export interface OrderStatusResponse {
  status: 'pending' | 'paid' | 'failed';
  found: boolean;
  rawStatus?: string | null;
  delivered?: boolean;
  credentials?: Credentials;
}
