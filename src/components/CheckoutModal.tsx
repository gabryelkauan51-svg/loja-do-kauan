import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import Spinner from './Spinner';
import DeliveryScreen from './DeliveryScreen';
import { createCheckout } from '../lib/api';
import { checkoutPrice, copyText, formatBRL, qrImageSrc } from '../lib/format';
import { useOrderPolling } from '../hooks/useOrderPolling';
import type { Account, CheckoutResponse, GameSlug } from '../types';

interface Props {
  /** Nova compra. Ignorado quando `resume` é informado. */
  account?: Account;
  game: GameSlug;
  /** Retoma um pedido já criado (ex.: o cliente fechou a janela). */
  resume?: CheckoutResponse;
  onCreated: (c: CheckoutResponse) => void;
  onFinish: () => void;
  onClose: () => void;
}

export default function CheckoutModal({ account, game, resume, onCreated, onFinish, onClose }: Props) {
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(resume ?? null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  const create = () => {
    if (!account) return;
    const acc = account as Record<string, unknown>;
    const accountId = acc.item_id ?? acc.itemId ?? acc.id;

    if (!accountId) {
      setError('ID do item não encontrado.');
      return;
    }
   setError(null);
    createCheckout(String(accountId), game)
      .then((c) => {
        // Valor final com margem: displayPrice do backend; chargedAmount só como fallback.
        const order: CheckoutResponse = { ...c, finalPrice: checkoutPrice(c, account.price) };
        setCheckout(order);
        onCreated(order);
      })
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    // O ref evita criar duas cobranças no StrictMode (dev).
    if (started.current || resume) return;
    started.current = true;
    create();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { result, error: pollError } = useOrderPolling(checkout);

  const paid = result?.status === 'paid';
  const credentials = result?.credentials ?? null;
  const delivered = paid && Boolean(result?.delivered) && credentials !== null;
  const failed = result?.status === 'failed';

  const finish = () => {
    onFinish();
    onClose();
  };

  if (delivered) {
    return (
      <Modal onClose={() => undefined} label="Conta entregue">
        <DeliveryScreen credentials={credentials} onDone={finish} />
      </Modal>
    );
  }

  const qrSrc = qrImageSrc(checkout?.qrCodeImage ?? null);
  const payload = checkout?.copyPaste ?? (qrSrc ? null : checkout?.qrCodeImage ?? null);
  const amount = checkoutPrice(checkout, account?.price);

  return (
    <Modal onClose={onClose} label="Pagamento via PIX">
      <div className="space-y-5 p-6">
        <h2 className="pr-10 text-xl font-extrabold">Pagamento via PIX</h2>

        {!checkout && !error && (
          <div className="flex items-center justify-center gap-3 py-16 text-zinc-400">
            <Spinner className="h-6 w-6" /> Gerando seu PIX…
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Não foi possível gerar o PIX. {error}
            </p>
            <button
              type="button"
              onClick={create}
              className="w-full rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-light"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {checkout && failed && (
          <div className="space-y-4">
            <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              Este PIX expirou ou foi cancelado. Volte à loja e gere um novo pagamento.
            </p>
            <button
              type="button"
              onClick={finish}
              className="w-full rounded-xl border border-line px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-brand"
            >
              Voltar à loja
            </button>
          </div>
        )}

        {checkout && !failed && (
          <>
            <div className="flex items-center justify-between rounded-xl border border-line bg-bg p-4">
              <span className="text-sm text-zinc-400">Valor do PIX</span>
              <span className="text-xl font-extrabold">{formatBRL(amount)}</span>
            </div>

            <div className="mx-auto w-fit rounded-xl bg-white p-3">
              {qrSrc ? (
                <img src={qrSrc} alt="QR Code do PIX" className="h-52 w-52" />
              ) : payload ? (
                <QRCodeSVG value={payload} size={208} />
              ) : null}
            </div>

            {payload && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-zinc-300">PIX Copia e Cola</p>
                <p className="max-h-20 overflow-y-auto break-all rounded-lg border border-line bg-bg p-3 font-mono text-xs text-zinc-400">
                  {payload}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (await copyText(payload)) {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="w-full rounded-xl bg-pix px-5 py-3 text-sm font-bold text-white transition hover:bg-pix-dark"
                >
                  {copied ? 'Código copiado' : 'Copiar código PIX'}
                </button>
              </div>
            )}

            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/10 p-4 text-sm text-zinc-200"
            >
              <Spinner />
              <span>
                {paid
                  ? 'Pagamento aprovado. Entregando sua conta…'
                  : 'Aguardando pagamento. Verificamos automaticamente a cada 5 segundos.'}
              </span>
            </div>

            {pollError && <p className="text-xs text-zinc-500">Falha ao verificar agora, tentando de novo: {pollError}</p>}

            <p className="text-xs text-zinc-500">
              Pode fechar esta janela depois de pagar: o pedido continua em andamento e você retoma pelo aviso no
              rodapé da loja.
              {checkout.expiresAt ? ` Válido até ${new Date(checkout.expiresAt).toLocaleString('pt-BR')}.` : ''}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
