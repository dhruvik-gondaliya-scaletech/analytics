import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AggregationType {
  COUNT = 'COUNT',
  UNIQUE_USERS = 'UNIQUE_USERS',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
}

export enum ChartType {
  METRIC = 'METRIC',
  LINE = 'LINE',
  AREA = 'AREA',
  BAR = 'BAR',
  PIE = 'PIE',
  FUNNEL = 'FUNNEL',
  RETENTION = 'RETENTION',
  TABLE = 'TABLE',
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
}

export class QueryFilterDto {
  @ApiProperty({ example: 'amount' })
  @IsString()
  @IsNotEmpty()
  property: string;

  @ApiProperty({ enum: FilterOperator, example: FilterOperator.EQUALS })
  @IsEnum(FilterOperator)
  operator: FilterOperator;

  @ApiProperty({ example: 1499 })
  value: any;
}

export class DateRangeDto {
  @ApiProperty({ example: '2026-09-01T00:00:00Z' })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ example: '2026-09-24T23:59:59Z' })
  @IsString()
  @IsNotEmpty()
  to: string;
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: ChartType, default: ChartType.LINE })
  @IsOptional()
  @IsEnum(ChartType)
  chart_type?: ChartType;

  @ApiPropertyOptional({ example: 'checkout.completed' })
  @IsOptional()
  @IsString()
  event_name?: string;

  @ApiPropertyOptional({ enum: AggregationType, default: AggregationType.COUNT })
  @IsOptional()
  @IsEnum(AggregationType)
  aggregation?: AggregationType;

  @ApiPropertyOptional({ example: 'amount' })
  @IsOptional()
  @IsString()
  property_key?: string;

  @ApiPropertyOptional({ type: [QueryFilterDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryFilterDto)
  filters?: QueryFilterDto[];

  @ApiProperty({ type: DateRangeDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DateRangeDto)
  date_range: DateRangeDto;

  @ApiPropertyOptional({ example: 'day', default: 'day' })
  @IsOptional()
  @IsString()
  interval?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'auto';

  @ApiPropertyOptional({ example: 'browser' })
  @IsOptional()
  @IsString()
  breakdown_by?: string;
}
