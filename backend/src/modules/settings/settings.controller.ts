import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateIngestionKeyDto } from './dto/create-key.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../database/entities/dashboard-user.entity';

@ApiTags('Settings')
@Controller('v1/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Ingestion Keys
  @Get('ingestion-keys')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List ingestion API keys (ADMIN only)' })
  async listKeys() {
    return this.settingsService.listKeys();
  }

  @Post('ingestion-keys')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new ingestion API write key (ADMIN only)' })
  async createKey(@Body() dto: CreateIngestionKeyDto) {
    return this.settingsService.createKey(dto);
  }

  @Delete('ingestion-keys/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke an ingestion API key (ADMIN only)' })
  async revokeKey(@Param('id') id: string) {
    return this.settingsService.revokeKey(id);
  }

  // Dashboard Users
  @Get('users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List dashboard users (ADMIN only)' })
  async listUsers() {
    return this.settingsService.listUsers();
  }

  @Post('users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create dashboard user (ADMIN only)' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.settingsService.createUser(dto);
  }

  @Put('users/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update dashboard user (ADMIN only)' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: Partial<CreateUserDto>,
  ) {
    return this.settingsService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete dashboard user (ADMIN only)' })
  async deleteUser(@Param('id') id: string) {
    return this.settingsService.deleteUser(id);
  }
}
