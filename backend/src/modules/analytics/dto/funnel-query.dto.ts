import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  ArrayMinSize,
  IsObject,
  ValidateNested,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DateRangeDto } from './analytics-query.dto';

export class FunnelQueryDto {
  @ApiProperty({ example: ['product.viewed', 'checkout.started', 'payment.completed'] })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  steps: string[];

  @ApiProperty({ type: DateRangeDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DateRangeDto)
  date_range: DateRangeDto;

  @ApiPropertyOptional({ example: 7, default: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  window_days?: number;
}
