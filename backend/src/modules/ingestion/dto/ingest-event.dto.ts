import { IsString, IsNotEmpty, IsOptional, IsObject, IsDateString, ValidateNested, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class EventContextDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  anonymous_id?: string;

  @IsOptional()
  @IsObject()
  request?: Record<string, any>;

  @IsOptional()
  @IsObject()
  device?: Record<string, any>;

  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @IsOptional()
  @IsObject()
  acquisition?: Record<string, any>;

  @IsOptional()
  @IsObject()
  custom?: Record<string, any>;
}

export class SingleEventDto {
  @IsOptional()
  @IsString()
  event_id?: string;

  @IsNotEmpty()
  @IsString()
  event_name: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => EventContextDto)
  context?: EventContextDto;

  @IsOptional()
  @IsDateString()
  occurred_at?: string;
}

export class BatchEventDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => SingleEventDto)
  events: SingleEventDto[];
}
