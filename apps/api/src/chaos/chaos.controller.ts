import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { UpdateChaosDto } from './chaos.dto';
import { ChaosService } from './chaos.service';

@Controller('chaos')
export class ChaosController {
  constructor(private readonly chaos: ChaosService) {}

  @Get()
  get() {
    return this.chaos.getConfig();
  }

  @Put()
  update(@Body() dto: UpdateChaosDto) {
    return this.chaos.update(dto);
  }

  @Post('reset')
  @HttpCode(200)
  reset() {
    return this.chaos.reset();
  }
}
