import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ChaosService } from '../chaos/chaos.service';
import { PrismaService } from '../prisma/prisma.service';

export interface StockLine {
  productId: string;
  quantity: number;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chaos: ChaosService,
  ) {}

  /** Baixa o estoque de todos os itens numa única transação. */
  async reserve(lines: StockLine[]): Promise<void> {
    await this.chaos.apply('inventory');
    await this.prisma.$transaction(async (tx) => {
      for (const { productId, quantity } of lines) {
        const { count } = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (count === 0) {
          throw new ConflictException(`Estoque insuficiente para o produto ${productId}`);
        }
      }
    });
    this.logger.log(`Estoque reservado para ${lines.length} item(ns)`);
  }

  /** Devolve ao estoque o que foi reservado (compensação). */
  async release(lines: StockLine[]): Promise<void> {
    await this.prisma.$transaction(
      lines.map(({ productId, quantity }) =>
        this.prisma.product.update({
          where: { id: productId },
          data: { stock: { increment: quantity } },
        }),
      ),
    );
    this.logger.log(`Estoque liberado para ${lines.length} item(ns)`);
  }
}
