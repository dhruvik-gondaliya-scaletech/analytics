import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@analytics.local' })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'AdminSecret2026!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
