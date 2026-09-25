import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../../database/entities/dashboard-user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'analyst@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.ANALYST })
  @IsEnum(UserRole)
  role: UserRole;
}
