'use client';

import type { CartDto } from '@ci-cd/shared-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError, errorMessage } from '../../lib/api';
import { ensureCart } from '../../lib/cart-session';
import { formatPrice } from '../../lib/format';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartDto>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    ensureCart()
      .then(setCart)
      .catch((err) => setError(errorMessage(err)));
  }, []);

  async function run(action: () => Promise<CartDto>) {
    setBusy(true);
    setError(undefined);
    try {
      setCart(await action());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function checkout(cartId: string) {
    setBusy(true);
    setError(undefined);
    try {
      const order = await api.checkout(cartId);
      router.push(`/checkout/result?orderId=${order.id}`);
    } catch (err) {
      // Se o pedido chegou a ser criado, a tela de resultado mostra o motivo da falha.
      const orderId = err instanceof ApiError ? err.body?.orderId : undefined;
      if (orderId) {
        router.push(`/checkout/result?orderId=${orderId}`);
        return;
      }
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (!cart) {
    return error ? <div className="alert alert-error">{error}</div> : <p>Carregando…</p>;
  }

  return (
    <>
      <h1>Carrinho</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {cart.items.length === 0 ? (
        <p>
          Seu carrinho está vazio. <Link href="/">Ver catálogo</Link>
        </p>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Quantidade</th>
                  <th>Subtotal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.emoji} {item.name}
                    </td>
                    <td>{formatPrice(item.unitPriceCents)}</td>
                    <td>
                      <div className="row">
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={busy || item.quantity <= 1}
                          onClick={() =>
                            run(() => api.updateCartItem(cart.id, item.id, item.quantity - 1))
                          }
                        >
                          −
                        </button>
                        {item.quantity}
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={busy}
                          onClick={() =>
                            run(() => api.updateCartItem(cart.id, item.id, item.quantity + 1))
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{formatPrice(item.subtotalCents)}</td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={busy}
                        onClick={() => run(() => api.removeCartItem(cart.id, item.id))}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row" style={{ marginTop: '1rem' }}>
            <span className="spacer" />
            <span className="price">Total: {formatPrice(cart.totalCents)}</span>
            <button className="btn" disabled={busy} onClick={() => checkout(cart.id)}>
              {busy ? 'Processando…' : 'Finalizar compra'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
