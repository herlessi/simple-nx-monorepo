import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { OrderDto } from '@ci-cd/shared-types';
import type { Prisma } from '@prisma/client';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutFailedException } from './checkout.errors';
import { InventoryService, StockLine } from './inventory.service';
import { NotificationService } from './notification.service';
import { PaymentService } from './payment.service';

const orderInclude = {
  items: { include: { product: true } },
} satisfies Prisma.OrderInclude;

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

const toOrderDto = (order: OrderWithItems): OrderDto => ({
  id: order.id,
  status: order.status,
  totalCents: order.totalCents,
  failureReason: order.failureReason,
  createdAt: order.createdAt.toISOString(),
  items: order.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    emoji: item.product.emoji,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
  })),
});

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

/**
 * Orquestra o checkout. Este é o fluxo principal da demo de telemetria:
 * carrinho -> pedido (PENDING) -> estoque -> pagamento -> pedido (PAID) -> notificação.
 */
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly inventory: InventoryService,
    private readonly payment: PaymentService,
    private readonly notification: NotificationService,
  ) {}

  async checkout(cartId: string): Promise<OrderDto> {
    const cart = await this.cart.get(cartId);
    if (cart.items.length === 0) throw new BadRequestException('O carrinho está vazio');

    const lines: StockLine[] = cart.items.map(({ productId, quantity }) => ({
      productId,
      quantity,
    }));

    const order = await this.prisma.order.create({
      data: {
        cartId,
        totalCents: cart.totalCents,
        items: {
          create: cart.items.map(({ productId, quantity, unitPriceCents }) => ({
            productId,
            quantity,
            unitPriceCents,
          })),
        },
      },
    });
    this.logger.log(`Pedido ${order.id} criado (PENDING), total=${order.totalCents}`);

    try {
      await this.inventory.reserve(lines);
    } catch (err) {
      await this.markFailed(order.id, err);
      throw new CheckoutFailedException(order.id, err);
    }

    try {
      await this.payment.charge(order.id, order.totalCents);
    } catch (err) {
      await this.inventory.release(lines);
      await this.markFailed(order.id, err);
      throw new CheckoutFailedException(order.id, err);
    }

    await this.prisma.order.update({ where: { id: order.id }, data: { status: 'PAID' } });
    await this.cart.clear(cartId);
    this.logger.log(`Pedido ${order.id} pago`);

    // Falha na notificação não desfaz o pedido: só fica registrada.
    try {
      await this.notification.sendOrderConfirmation(order.id);
    } catch (err) {
      this.logger.warn(`Falha ao notificar o pedido ${order.id}: ${errorMessage(err)}`);
    }

    return this.getOrder(order.id);
  }

  async getOrder(id: string): Promise<OrderDto> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw new NotFoundException(`Pedido ${id} não encontrado`);
    return toOrderDto(order);
  }

  private async markFailed(orderId: string, err: unknown) {
    const reason = errorMessage(err);
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'FAILED', failureReason: reason },
    });
    this.logger.warn(`Pedido ${orderId} falhou: ${reason}`);
  }
}
