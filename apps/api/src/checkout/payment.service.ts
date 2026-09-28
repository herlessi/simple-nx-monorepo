import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ChaosInjectedError, ChaosService } from '../chaos/chaos.service';
import { randomBetween, sleep } from '../common/async';
import { PaymentDeclinedException } from './checkout.errors';

/** Gateway de pagamento simulado. */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly chaos: ChaosService) {}

  async charge(orderId: string, amountCents: number): Promise<{ transactionId: string }> {
    try {
      await this.chaos.apply('payment');
    } catch (err) {
      if (err instanceof ChaosInjectedError) {
        throw new PaymentDeclinedException('a operadora recusou a transação');
      }
      throw err;
    }

    // Simula o tempo de resposta de um gateway externo.
    await sleep(randomBetween(100, 300));
    const transactionId = randomUUID();
    this.logger.log(
      `Pagamento aprovado: pedido=${orderId} valor=${amountCents} transação=${transactionId}`,
    );
    return { transactionId };
  }
}
