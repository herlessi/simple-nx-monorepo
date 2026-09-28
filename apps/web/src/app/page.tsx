import Link from 'next/link';
import { AddToCartButton } from '../components/add-to-cart-button';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const products = await api.listProducts();

  return (
    <>
      <h1>Catálogo</h1>
      <div className="grid">
        {products.map((product) => (
          <article key={product.id} className="card">
            <span className="emoji">{product.emoji}</span>
            <Link href={`/products/${product.id}`}>
              <strong>{product.name}</strong>
            </Link>
            <span className="price">{formatPrice(product.priceCents)}</span>
            <span className="muted">{product.stock} em estoque</span>
            <AddToCartButton productId={product.id} />
          </article>
        ))}
      </div>
    </>
  );
}
