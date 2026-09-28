import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { ChaosModule } from '../chaos/chaos.module';
import { CheckoutModule } from '../checkout/checkout.module';
import { RequestLoggingMiddleware } from '../common/request-logging.middleware';
import { HealthModule } from '../health/health.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    PrismaModule,
    ChaosModule,
    ProductsModule,
    CartModule,
    CheckoutModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*path');
  }
}
