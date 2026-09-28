import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import type { CheckoutRequest } from '@ci-cd/shared-types';
import { IsUUID } from 'class-validator';
import { CheckoutService } from './checkout.service';

export class CheckoutDto implements CheckoutRequest {
  @IsUUID()
  cartId!: string;
}

@Controller()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('checkout')
  checkout(@Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(dto.cartId);
  }

  @Get('orders/:id')
  getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.checkoutService.getOrder(id);
  }
}
