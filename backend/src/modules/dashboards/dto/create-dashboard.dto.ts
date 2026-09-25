import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { InsightVisibility } from '../../../database/entities/saved-insight.entity';

export class CreateDashboardDto {
  @ApiProperty({ example: 'Executive Overview' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Main product metrics and funnel conversions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: InsightVisibility, default: InsightVisibility.SHARED })
  @IsOptional()
  @IsEnum(InsightVisibility)
  visibility?: InsightVisibility;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
