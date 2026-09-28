import { Injectable, NotFoundException } from '@nestjs/common';
import type { ProductDto } from '@ci-cd/shared-types';
import type { Product } from '@prisma/client';
import { ChaosService } from '../chaos/chaos.service';
import { PrismaService } from '../prisma/prisma.service';

export const toProductDto = (p: Product): ProductDto => ({
  id: p.id,
  name: p.name,
  description: p.description,
  emoji: p.emoji,
  priceCents: p.priceCents,
  stock: p.stock,
});

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chaos: ChaosService,
  ) {}

  async findAll(): Promise<ProductDto[]> {
    await this.chaos.apply('products');
    const products = await this.prisma.product.findMany({ orderBy: { name: 'asc' } });
    return products.map(toProductDto);
  }

  async findOne(id: string): Promise<ProductDto> {
    await this.chaos.apply('products');
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`Produto ${id} não encontrado`);
    return toProductDto(product);
  }
}
