import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class GridPositionDto {
  @ApiProperty({ example: 0 })
  x: number;

  @ApiProperty({ example: 0 })
  y: number;

  @ApiProperty({ example: 6 })
  w: number;

  @ApiProperty({ example: 4 })
  h: number;
}

export class AddWidgetDto {
  @ApiPropertyOptional({ example: 'insight-uuid-123' })
  @IsOptional()
  @IsString()
  insight_id?: string;

  @ApiProperty({ type: GridPositionDto })
  @IsObject()
  grid_position: GridPositionDto;
}
