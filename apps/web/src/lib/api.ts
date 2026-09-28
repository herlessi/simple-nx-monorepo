import type {
  AddCartItemRequest,
  ApiErrorBody,
  CartDto,
  ChaosConfigDto,
  OrderDto,
  ProductDto,
} from '@ci-cd/shared-types';

const DEFAULT_API_URL = 'http://localhost:3000/api';

// No servidor (Server Components) usamos API_URL; no browser, NEXT_PUBLIC_API_URL.
const baseUrl =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? DEFAULT_API_URL)
    : (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL);

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => undefined)) as ApiErrorBody | undefined;
    throw new ApiError(res.status, body?.message ?? res.statusText, body);
  }
  return (await res.json()) as T;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const api = {
  listProducts: () => request<ProductDto[]>('/products'),
  getProduct: (id: string) => request<ProductDto>(`/products/${id}`),

  createCart: () => request<CartDto>('/cart', json('POST')),
  getCart: (id: string) => request<CartDto>(`/cart/${id}`),
  addCartItem: (cartId: string, body: AddCartItemRequest) =>
    request<CartDto>(`/cart/${cartId}/items`, json('POST', body)),
  updateCartItem: (cartId: string, itemId: string, quantity: number) =>
    request<CartDto>(`/cart/${cartId}/items/${itemId}`, json('PATCH', { quantity })),
  removeCartItem: (cartId: string, itemId: string) =>
    request<CartDto>(`/cart/${cartId}/items/${itemId}`, json('DELETE')),

  checkout: (cartId: string) => request<OrderDto>('/checkout', json('POST', { cartId })),
  getOrder: (id: string) => request<OrderDto>(`/orders/${id}`),

  getChaos: () => request<ChaosConfigDto>('/chaos'),
  updateChaos: (config: ChaosConfigDto) => request<ChaosConfigDto>('/chaos', json('PUT', config)),
  resetChaos: () => request<ChaosConfigDto>('/chaos/reset', json('POST')),
};

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Erro inesperado';
