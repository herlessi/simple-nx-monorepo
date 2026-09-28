import type { ChaosConfigDto, ChaosRule } from '@ci-cd/shared-types';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min, ValidateNested } from 'class-validator';

export class ChaosRuleDto implements ChaosRule {
  @IsInt()
  @Min(0)
  @Max(10000)
  latencyMs!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  errorRate!: number;
}

export class UpdateChaosDto implements Partial<ChaosConfigDto> {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChaosRuleDto)
  products?: ChaosRuleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChaosRuleDto)
  inventory?: ChaosRuleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChaosRuleDto)
  payment?: ChaosRuleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChaosRuleDto)
  notification?: ChaosRuleDto;
}
