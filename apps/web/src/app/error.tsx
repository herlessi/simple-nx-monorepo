'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <div className="alert alert-error">
        Não foi possível carregar esta página: {error.message}
      </div>
      <button className="btn" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
