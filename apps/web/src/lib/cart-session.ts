import type { CartDto } from '@ci-cd/shared-types';
import { api, ApiError } from './api';

const STORAGE_KEY = 'mini-shop:cartId';

/**
 * Retorna o carrinho do visitante (id guardado no localStorage) ou cria um novo.
 * Só pode ser usado no browser.
 */
export async function ensureCart(): Promise<CartDto> {
  const id = localStorage.getItem(STORAGE_KEY);
  if (id) {
    try {
      return await api.getCart(id);
    } catch (err) {
      // 404/400: o carrinho sumiu (ex.: banco re-semeado). Cria outro.
      if (!(err instanceof ApiError && (err.status === 404 || err.status === 400))) throw err;
    }
  }
  const cart = await api.createCart();
  localStorage.setItem(STORAGE_KEY, cart.id);
  return cart;
}
