import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { api, ApiError } from '../../../lib/api';
import { formatPrice } from '../../../lib/format';

export const dynamic = 'force-dynamic';

async function loadOrder(id: string) {
  try {
    return await api.getOrder(id);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    throw err;
  }
}

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) redirect('/');

  const order = await loadOrder(orderId);
  const paid = order.status === 'PAID';

  return (
    <>
      <h1>{paid ? 'Pedido confirmado 🎉' : 'Não foi possível concluir o pedido'}</h1>
      <div className={`alert ${paid ? 'alert-success' : 'alert-error'}`}>
        Pedido <code>{order.id}</code> — status <strong>{order.status}</strong>
        {order.failureReason && <> — {order.failureReason}</>}
      </div>

      <div className="table-wrap">
        <table className="table">
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td>
                  {item.emoji} {item.name}
                </td>
                <td>{item.quantity}×</td>
                <td>{formatPrice(item.unitPriceCents * item.quantity)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}>
                <strong>Total</strong>
              </td>
              <td>
                <strong>{formatPrice(order.totalCents)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="row" style={{ marginTop: '1rem' }}>
        <Link href="/">Continuar comprando</Link>
        {!paid && <Link href="/cart">Voltar ao carrinho</Link>}
      </p>
    </>
  );
}
