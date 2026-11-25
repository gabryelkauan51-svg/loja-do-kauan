import { useEffect, useState } from 'react';
import { fetchOrderStatus } from '../lib/api';
import type { OrderStatusResponse } from '../types';

/**
 * Consulta o pedido a cada 5 segundos até o pagamento ser aprovado
 * e as credenciais serem entregues (ou até o pedido falhar/expirar).
 */
export function useOrderPolling(
  order: { orderId: string | null; externalRef: string } | null,
  intervalMs = 5000,
) {
  const [result, setResult] = useState<OrderStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = order?.orderId ?? null;
  const externalRef = order?.externalRef ?? null;

  useEffect(() => {
    if (!orderId && !externalRef) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        const res = await fetchOrderStatus({ orderId, externalRef });
        if (cancelled) return;
        setResult(res);
        setError(null);
        const finished = res.status === 'failed' || (res.status === 'paid' && res.delivered);
        if (finished) return;
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
      }
      timer = setTimeout(tick, intervalMs);
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, externalRef, intervalMs]);

  return { result, error };
}
