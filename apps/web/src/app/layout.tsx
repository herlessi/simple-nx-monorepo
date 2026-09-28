import Link from 'next/link';
import './global.css';

export const metadata = {
  title: 'Mini Shop',
  description: 'Mini e-commerce de exemplo em um monorepo Nx',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="header">
          <Link href="/" className="brand">
            🛍️ Mini Shop
          </Link>
          <nav className="nav">
            <Link href="/">Catálogo</Link>
            <Link href="/cart">Carrinho</Link>
            <Link href="/chaos">Chaos</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
