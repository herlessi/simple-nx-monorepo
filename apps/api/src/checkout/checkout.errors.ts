import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentDeclinedException extends HttpException {
  constructor(reason: string) {
    super(
      { message: `Pagamento recusado: ${reason}`, error: 'Payment Required' },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

/**
 * Envolve uma falha que aconteceu depois de o pedido ser criado, preservando
 * o status HTTP original e anexando o `orderId` ao corpo de erro.
 */
export class CheckoutFailedException extends HttpException {
  constructor(orderId: string, cause: unknown) {
    const status =
      cause instanceof HttpException ? cause.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      cause instanceof HttpException ? cause.message : 'Erro inesperado no checkout';
    super({ message, error: 'Checkout Failed', orderId }, status, { cause });
  }
}
