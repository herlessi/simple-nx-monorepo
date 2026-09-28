export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface CheckoutRequest {
  cartId: string;
}

export interface OrderItemDto {
  productId: string;
  name: string;
  emoji: string;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderDto {
  id: string;
  status: OrderStatus;
  totalCents: number;
  failureReason: string | null;
  createdAt: string;
  items: OrderItemDto[];
}
