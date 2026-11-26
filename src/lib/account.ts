import type { Account, Skin } from '../types';

/* ------------------------------------------------------------------ */
/* Métricas da conta — lidas só dos campos reais que a API devolve.   */
/* ------------------------------------------------------------------ */

export type StatKind = 'rank' | 'skins' | 'knives' | 'agents' | 'champions' | 'level' | 'currency' | 'region';

export interface Stat {
  kind: StatKind;
  key: string;
  label: string;
  value: string;
}

const norm = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');

const RULES: { kind: StatKind; label: string; test: RegExp; text?: boolean }[] = [
  { kind: 'rank', label: 'Elo / Rank', test: /(rank|elo|tier|division)/, text: true },
  { kind: 'knives', label: 'Facas', test: /(knife|knives|faca|melee)/ },
  { kind: 'skins', label: 'Skins', test: /skin/ },
  { kind: 'agents', label: 'Agentes', test: /agent/ },
  { kind: 'champions', label: 'Campeões', test: /champion|brawler|character|personage/ },
  { kind: 'level', label: 'Nível', test: /(level|lvl|nivel)/ },
  {
    kind: 'currency',
    label: 'Moeda / Pontos',
    test: /(valorantpoints|vbucks|robux|balance|coins|gems|primogem|wallet|currency|moeda|points|^vp$|vp$|^rp$|blueessence|gold)/,
  },
  { kind: 'region', label: 'Região', test: /(region|server|country|regiao)/, text: true },
];

function numeric(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() && /^-?\d+(\.\d+)?$/.test(v.trim())) return Number(v);
  return null;
}

/**
 * Extrai métricas conhecidas dos campos de primeiro nível da conta.
 * `skins` (lista dos detalhes) entra como contagem se a API não mandar um total.
 */
export function getAccountStats(acc: Account, skins?: Skin[]): Stat[] {
  const found = new Map<StatKind, Stat>();

  for (const [rawKey, v] of Object.entries(acc)) {
    if (rawKey === 'price' || rawKey === 'id') continue;
    const k = norm(rawKey);
    for (const rule of RULES) {
      if (found.has(rule.kind) || !rule.test.test(k)) continue;

      let value: string | null = null;
      if (rule.text) {
        if (typeof v === 'string' && v.trim()) value = v.trim();
        else if (typeof v === 'number' && Number.isFinite(v)) value = String(v);
      } else if (Array.isArray(v)) {
        value = v.length > 0 ? String(v.length) : null;
      } else {
        const n = numeric(v);
        if (n !== null && n >= 0) value = n.toLocaleString('pt-BR');
      }

      if (value !== null) {
        found.set(rule.kind, { kind: rule.kind, key: rawKey, label: rule.label, value });
        break;
      }
    }
  }

  if (!found.has('skins') && skins && skins.length > 0) {
    found.set('skins', { kind: 'skins', key: '', label: 'Skins', value: skins.length.toLocaleString('pt-BR') });
  }

  const order: StatKind[] = ['rank', 'skins', 'knives', 'agents', 'champions', 'level', 'currency', 'region'];
  return order.map((k) => found.get(k)).filter((s): s is Stat => Boolean(s));
}

/** Sinais de que a conta não está mais à venda. */
export function looksUnavailable(acc: Record<string, unknown>): boolean {
  const flags = ['sold', 'isSold', 'is_sold'];
  if (flags.some((f) => acc[f] === true)) return true;
  if (acc.available === false || acc.isAvailable === false) return true;
  const status = [acc.status, acc.item_state, acc.itemState, acc.state].find((s) => typeof s === 'string') as
    | string
    | undefined;
  return Boolean(status && /^(sold|closed|deleted|unavailable|vendid[ao]|indispon)/i.test(status));
}

/* ------------------------------------------------------------------ */
/* Inventário                                                         */
/* ------------------------------------------------------------------ */

export interface InventoryItem {
  name: string;
  image: string | null;
  category: string | null;
  rarity: string | null;
  color: string;
  extra: string | null;
}

function pickStr(s: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = s[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

const RARITY_COLORS: [RegExp, string][] = [
  [/(ultra|mythic|m[ií]tic|transcend)/i, '#FACC15'],
  [/(exclusive|exclusiv|legend|lend[aá]r)/i, '#F59E0B'],
  [/(premium|epic|[ée]pic)/i, '#D946EF'],
  [/(rare|raro|rara)/i, '#3B82F6'],
  [/(deluxe|uncommon|incomum)/i, '#14B8A6'],
  [/(select|common|comum)/i, '#60A5FA'],
];

export function rarityColor(rarity: string | null, explicit?: string | null): string {
  if (explicit && /^#?[0-9a-f]{6}$/i.test(explicit)) return explicit.startsWith('#') ? explicit : `#${explicit}`;
  if (rarity) for (const [re, c] of RARITY_COLORS) if (re.test(rarity)) return c;
  return '#52525B';
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function toInventoryItem(s: Skin): InventoryItem {
  if (typeof s === 'string') return { name: s, image: null, category: null, rarity: null, color: rarityColor(null), extra: null };
  const rarity = pickStr(s, ['rarity', 'rarityName', 'rarity_name', 'tier', 'tierName', 'quality']);
  const category = pickStr(s, ['category', 'categoryName', 'category_name', 'type', 'kind', 'group', 'itemType', 'item_type', 'slot']);
  return {
    name: pickStr(s, ['name', 'title', 'displayName', 'display_name']) ?? 'Item',
    image: pickStr(s, ['image', 'imageUrl', 'image_url', 'icon', 'iconUrl', 'icon_url', 'thumbnail', 'displayIcon']),
    category: category ? capitalize(category.replace(/[_-]+/g, ' ')) : null,
    rarity: rarity && !/^[0-9a-f-]{20,}$/i.test(rarity) ? capitalize(rarity) : null,
    color: rarityColor(rarity, pickStr(s, ['rarityColor', 'rarity_color', 'color'])),
    extra: pickStr(s, ['weapon', 'champion', 'agent']),
  };
}

/* ------------------------------------------------------------------ */
/* Imagem da conta                                                     */
/* ------------------------------------------------------------------ */

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else line = test;
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines;
}

interface SummaryData {
  id: string;
  title: string;
  game: string;
  accent: string;
  price: string;
  stats: Stat[];
}

/** Gera um PNG com o resumo real da conta (usado quando não há imagem baixável). */
function summaryPng(d: SummaryData): string {
  const W = 1080;
  const H = 1080;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0E1017');
  bg.addColorStop(1, '#07080C');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, 700);
  glow.addColorStop(0, `${d.accent}55`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#A78BFA';
  ctx.font = '700 34px "Chakra Petch", sans-serif';
  ctx.fillText('KAUAN STORE', 80, 120);

  ctx.fillStyle = d.accent;
  ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(d.game.toUpperCase(), 80, 220);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 64px "Plus Jakarta Sans", sans-serif';
  const lines = wrap(ctx, d.title, W - 160, 3);
  lines.forEach((l, i) => ctx.fillText(l, 80, 310 + i * 78));

  let y = 310 + lines.length * 78 + 50;
  ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
  for (const s of d.stats.slice(0, 6)) {
    ctx.fillStyle = '#71717A';
    ctx.fillText(s.label, 80, y);
    ctx.fillStyle = '#F4F4F5';
    const w = ctx.measureText(s.value).width;
    ctx.fillText(s.value, W - 80 - w, y);
    y += 62;
  }

  ctx.fillStyle = '#10B981';
  ctx.font = '800 80px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(d.price, 80, H - 110);
  ctx.fillStyle = '#71717A';
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Pague com PIX · Conta #${d.id}`, 80, H - 60);

  return c.toDataURL('image/png');
}

/** Baixa a imagem real da conta; se não houver (ou o servidor bloquear), baixa um resumo em PNG. */
export async function downloadAccountImage(image: string | null, summary: SummaryData): Promise<void> {
  const base = `kauan-store-conta-${summary.id}`;
  if (image) {
    try {
      const res = await fetch(image, { mode: 'cors' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg').replace(/\+.*/, '');
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${base}.${ext}`);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return;
    } catch {
      /* cai para o resumo */
    }
  }
  triggerDownload(summaryPng(summary), `${base}.png`);
}
