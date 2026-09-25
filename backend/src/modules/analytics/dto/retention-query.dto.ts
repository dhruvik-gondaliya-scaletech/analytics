import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { DateRangeDto } from './analytics-query.dto';

export class RetentionQueryDto {
  @ApiProperty({ example: 'user.signup' })
  @IsString()
  @IsNotEmpty()
  cohort_event: string;

  @ApiPropertyOptional({ example: 'checkout.completed' })
  @IsOptional()
  @IsString()
  return_event?: string;

  @ApiProperty({ type: DateRangeDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DateRangeDto)
  date_range: DateRangeDto;
}
