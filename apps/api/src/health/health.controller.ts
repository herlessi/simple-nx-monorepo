import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ message: 'Banco de dados indisponível', db: 'down' });
    }
    return { status: 'ok', db: 'up', uptimeSeconds: Math.round(process.uptime()) };
  }
}
