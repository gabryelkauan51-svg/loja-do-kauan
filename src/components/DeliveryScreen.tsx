import { useState } from 'react';
import { copyText, humanize } from '../lib/format';
import type { Credentials } from '../types';

interface Props {
  credentials: Credentials;
  onDone: () => void;
}

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }
      }}
      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
        done ? 'bg-pix text-white' : 'border border-line text-zinc-200 hover:border-pix hover:text-white'
      }`}
    >
      {done ? 'Copiado' : label}
    </button>
  );
}

function flatten(c: Credentials): [string, string][] {
  if (!c) return [];
  if (typeof c === 'string') return [['Dados da conta', c]];
  const rows: [string, string][] = [];
  const walk = (obj: Record<string, unknown>, prefix = '') => {
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined || v === '') continue;
      const label = prefix ? `${prefix} · ${humanize(k)}` : humanize(k);
      if (typeof v === 'object' && !Array.isArray(v)) walk(v as Record<string, unknown>, label);
      else rows.push([label, Array.isArray(v) ? v.join(', ') : String(v)]);
    }
  };
  walk(c);
  return rows;
}

export default function DeliveryScreen({ credentials, onDone }: Props) {
  const rows = flatten(credentials);
  const all = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  return (
    <div className="space-y-5 p-6">
      <div className="pr-10">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pix/20 text-pix">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </span>
        <h2 className="text-xl font-extrabold">Pagamento aprovado</h2>
        <p className="mt-1 text-sm text-zinc-400">Sua conta foi entregue. Salve os dados abaixo antes de fechar esta janela.</p>
      </div>

      <ul className="space-y-2">
        {rows.map(([label, value]) => (
          <li key={label} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg p-3">
            <span className="min-w-0">
              <span className="block text-xs text-zinc-500">{label}</span>
              <span className="block break-all font-mono text-sm text-white">{value}</span>
            </span>
            <CopyButton text={value} />
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={async () => {
            await copyText(all);
          }}
          className="flex-1 rounded-xl bg-pix px-5 py-3 text-sm font-bold text-white transition hover:bg-pix-dark"
        >
          Copiar tudo
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-brand hover:text-white"
        >
          Já salvei, concluir
        </button>
      </div>
    </div>
  );
}
