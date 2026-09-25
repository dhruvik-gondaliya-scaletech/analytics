import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsInt,
  Min,
  Matches,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class EventContextDto {
  @ApiPropertyOptional({ example: 'user_123' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ example: 'anon_456' })
  @IsOptional()
  @IsString()
  anonymous_id?: string;

  @ApiPropertyOptional({ example: 'session_789' })
  @IsOptional()
  @IsString()
  session_id?: string;

  @ApiPropertyOptional({ example: '2026-09-24T08:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ example: 'production' })
  @IsOptional()
  @IsString()
  environment?: string;

  @ApiPropertyOptional({ example: '127.0.0.1' })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiPropertyOptional({ example: 'desktop' })
  @IsOptional()
  @IsString()
  device_type?: string;

  @ApiPropertyOptional({ example: 'Chrome' })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({ example: 'Linux' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ example: 'IN' })
  @IsOptional()
  @IsString()
  country?: string;

  [key: string]: any;
}

export class IngestEventDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  event_id?: string;

  @ApiProperty({ example: 'checkout.completed' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  @Matches(/^[a-z0-9]+([._-][a-z0-9]+)*$/, {
    message:
      'event_name must be lowercase alphanumeric separated by dots, dashes, or underscores (e.g. user.signup)',
  })
  event_name: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  event_version?: number;

  @ApiPropertyOptional({ example: { amount: 1499, currency: 'INR' } })
  @IsOptional()
  @IsObject()
  event_data?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: EventContextDto;
}
