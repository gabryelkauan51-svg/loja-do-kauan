import type { Account, CheckoutResponse } from '../types';

/** Preço válido = número finito e maior que zero. */
export function isValidPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/** Converte números vindos como string ("129.90") sem aceitar lixo. */
function toPrice(value: unknown): number | null {
  if (isValidPrice(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    if (isValidPrice(n)) return n;
  }
  return null;
}

/** Retorna o primeiro preço válido da lista, ou null. */
export function pickPrice(...candidates: unknown[]): number | null {
  for (const c of candidates) {
    const n = toPrice(c);
    if (n !== null) return n;
  }
  return null;
}

/**
 * Valor final (com margem) de um pedido PIX.
 * Ordem: `displayPrice` do create-checkout → valor final já salvo no pedido →
 * preço do catálogo (já com margem) → `chargedAmount` apenas como último recurso.
 */
export function checkoutPrice(
  checkout: Pick<CheckoutResponse, 'displayPrice' | 'chargedAmount' | 'finalPrice'> | null | undefined,
  catalogPrice?: unknown,
): number | null {
  if (!checkout) return pickPrice(catalogPrice);
  return pickPrice(checkout.displayPrice, checkout.finalPrice, catalogPrice, checkout.chargedAmount);
}

export function formatBRL(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Consultar';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para navegadores sem Clipboard API
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export function humanize(key: string): string {
  const spaced = key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function firstString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

const TAG_KEYS = [
  'rank', 'elo', 'tier', 'level', 'region', 'server', 'platform', 'country',
  'skinsCount', 'skins_count', 'agents', 'champions', 'trophies', 'gems',
];

export function getAccountMeta(acc: Account) {
  const title = firstString(acc, ['title', 'name', 'nickname', 'username', 'headline']) ?? `Conta #${acc.id}`;

  let image = firstString(acc, ['image', 'imageUrl', 'image_url', 'thumbnail', 'thumb', 'cover', 'picture']);
  if (!image && Array.isArray(acc.images) && typeof acc.images[0] === 'string') {
    image = acc.images[0] as string;
  }

  const description = firstString(acc, ['description', 'desc', 'details']);

  const tags: string[] = [];
  if (Array.isArray(acc.tags)) {
    for (const t of acc.tags) if (typeof t === 'string' && t.trim()) tags.push(t.trim());
  }
  for (const k of TAG_KEYS) {
    const v = acc[k];
    if (typeof v === 'string' || typeof v === 'number') tags.push(`${humanize(k)}: ${v}`);
  }

  return { title, image, description, tags: tags.slice(0, 6) };
}

/** Aceita URL, data URL ou base64 puro. Retorna null se for um payload de texto (Pix). */
export function qrImageSrc(qr: string | null): string | null {
  if (!qr) return null;
  if (qr.startsWith('data:') || qr.startsWith('http')) return qr;
  if (/^[A-Za-z0-9+/=\s]{200,}$/.test(qr)) return `data:image/png;base64,${qr.replace(/\s/g, '')}`;
  return null;
}
