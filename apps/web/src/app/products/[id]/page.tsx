import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '../../../components/add-to-cart-button';
import { api, ApiError } from '../../../lib/api';
import { formatPrice } from '../../../lib/format';

export const dynamic = 'force-dynamic';

async function loadProduct(id: string) {
  try {
    return await api.getProduct(id);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    throw err;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await loadProduct(id);

  return (
    <>
      <p>
        <Link href="/">← Voltar ao catálogo</Link>
      </p>
      <article className="card">
        <span className="emoji-lg">{product.emoji}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <span className="price">{formatPrice(product.priceCents)}</span>
        <span className="muted">{product.stock} em estoque</span>
        <AddToCartButton productId={product.id} />
      </article>
    </>
  );
}
