'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, errorMessage } from '../lib/api';
import { ensureCart } from '../lib/cart-session';

type Status = 'idle' | 'loading' | 'added' | 'error';

export function AddToCartButton({ productId }: { productId: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>();

  async function handleClick() {
    setStatus('loading');
    try {
      const cart = await ensureCart();
      await api.addCartItem(cart.id, { productId, quantity: 1 });
      setStatus('added');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('error');
    }
  }

  return (
    <div className="row">
      <button className="btn" onClick={handleClick} disabled={status === 'loading'}>
        {status === 'loading' ? 'Adicionando…' : 'Adicionar ao carrinho'}
      </button>
      {status === 'added' && <Link href="/cart">✓ Ver carrinho</Link>}
      {status === 'error' && <span className="muted">{error}</span>}
    </div>
  );
}
