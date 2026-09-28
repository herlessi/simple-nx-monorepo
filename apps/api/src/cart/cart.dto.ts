import type { AddCartItemRequest, UpdateCartItemRequest } from '@ci-cd/shared-types';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class AddCartItemDto implements AddCartItemRequest {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

export class UpdateCartItemDto implements UpdateCartItemRequest {
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
