import { Injectable, NotFoundException } from '@nestjs/common';
import type { CartDto } from '@ci-cd/shared-types';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './cart.dto';

const cartInclude = {
  items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

const toCartDto = (cart: CartWithItems): CartDto => {
  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    emoji: item.product.emoji,
    unitPriceCents: item.product.priceCents,
    quantity: item.quantity,
    subtotalCents: item.product.priceCents * item.quantity,
  }));
  return {
    id: cart.id,
    items,
    totalCents: items.reduce((sum, item) => sum + item.subtotalCents, 0),
  };
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async create(): Promise<CartDto> {
    const cart = await this.prisma.cart.create({ data: {}, include: cartInclude });
    return toCartDto(cart);
  }

  async get(id: string): Promise<CartDto> {
    const cart = await this.prisma.cart.findUnique({ where: { id }, include: cartInclude });
    if (!cart) throw new NotFoundException(`Carrinho ${id} não encontrado`);
    return toCartDto(cart);
  }

  async addItem(cartId: string, { productId, quantity }: AddCartItemDto): Promise<CartDto> {
    await this.get(cartId);
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Produto ${productId} não encontrado`);

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
    return this.get(cartId);
  }

  async updateItem(cartId: string, itemId: string, quantity: number): Promise<CartDto> {
    const { count } = await this.prisma.cartItem.updateMany({
      where: { id: itemId, cartId },
      data: { quantity },
    });
    if (count === 0) throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    return this.get(cartId);
  }

  async removeItem(cartId: string, itemId: string): Promise<CartDto> {
    const { count } = await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
    if (count === 0) throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    return this.get(cartId);
  }

  async clear(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
