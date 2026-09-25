import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeleteUserDataDto {
  @ApiPropertyOptional({ example: 'user_123' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ example: 'anon_456' })
  @IsOptional()
  @IsString()
  anonymous_id?: string;
}
