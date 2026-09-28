import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AddCartItemDto, UpdateCartItemDto } from './cart.dto';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Post()
  create() {
    return this.cart.create();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.cart.get(id);
  }

  @Post(':id/items')
  addItem(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cart.updateItem(id, itemId, dto.quantity);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cart.removeItem(id, itemId);
  }
}
