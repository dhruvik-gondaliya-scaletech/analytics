import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from '../../../database/entities/event-definition.entity';

export class PropertyDefDto {
  @ApiProperty({ example: 'amount' })
  @IsString()
  @IsNotEmpty()
  property_name: string;

  @ApiPropertyOptional({ example: 'Amount Paid' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional({ example: 'number', default: 'string' })
  @IsOptional()
  @IsString()
  data_type?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateEventDefDto {
  @ApiProperty({ example: 'checkout.completed' })
  @IsString()
  @IsNotEmpty()
  event_name: string;

  @ApiPropertyOptional({ example: 'Completed Checkout' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional({ example: 'Triggered when user completes checkout' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'e-commerce', default: 'general' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: EventStatus, default: EventStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ type: [PropertyDefDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyDefDto)
  properties?: PropertyDefDto[];
}
