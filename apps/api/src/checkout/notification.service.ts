import { Injectable, Logger } from '@nestjs/common';
import { ChaosService } from '../chaos/chaos.service';
import { randomBetween, sleep } from '../common/async';

/** Envio de e-mail simulado. */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly chaos: ChaosService) {}

  async sendOrderConfirmation(orderId: string): Promise<void> {
    await this.chaos.apply('notification');
    await sleep(randomBetween(50, 150));
    this.logger.log(`E-mail de confirmação enviado para o pedido ${orderId}`);
  }
}
