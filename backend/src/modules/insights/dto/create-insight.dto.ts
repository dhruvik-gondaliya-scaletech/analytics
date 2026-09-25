import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { InsightVisibility } from '../../../database/entities/saved-insight.entity';

export class CreateInsightDto {
  @ApiProperty({ example: 'Checkout Conversions Trend' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Weekly count of completed checkouts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'time_series', default: 'time_series' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: { chart_type: 'LINE', event_name: 'checkout.completed', aggregation: 'COUNT', date_range: { from: '2026-09-01T00:00:00Z', to: '2026-09-24T23:59:59Z' }, interval: 'day' } })
  @IsObject()
  chart_config: Record<string, any>;

  @ApiPropertyOptional({ enum: InsightVisibility, default: InsightVisibility.SHARED })
  @IsOptional()
  @IsEnum(InsightVisibility)
  visibility?: InsightVisibility;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_pinned_to_overview?: boolean;
}
