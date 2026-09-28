import { Global, Module } from '@nestjs/common';
import { ChaosController } from './chaos.controller';
import { ChaosService } from './chaos.service';

@Global()
@Module({
  controllers: [ChaosController],
  providers: [ChaosService],
  exports: [ChaosService],
})
export class ChaosModule {}
