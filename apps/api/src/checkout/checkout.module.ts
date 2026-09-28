import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { InventoryService } from './inventory.service';
import { NotificationService } from './notification.service';
import { PaymentService } from './payment.service';

@Module({
  imports: [CartModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, InventoryService, PaymentService, NotificationService],
})
export class CheckoutModule {}
