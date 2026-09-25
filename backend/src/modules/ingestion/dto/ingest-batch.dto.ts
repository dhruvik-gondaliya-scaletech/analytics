import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { IngestEventDto } from './ingest-event.dto';

export class IngestBatchDto {
  @ApiProperty({ type: [IngestEventDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => IngestEventDto)
  events: IngestEventDto[];
}
