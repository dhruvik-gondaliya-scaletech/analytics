import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateIngestionKeyDto {
  @ApiProperty({ example: 'Production Webhook Key' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
