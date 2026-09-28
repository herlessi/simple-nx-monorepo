export interface CartItemDto {
  id: string;
  productId: string;
  name: string;
  emoji: string;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  totalCents: number;
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
