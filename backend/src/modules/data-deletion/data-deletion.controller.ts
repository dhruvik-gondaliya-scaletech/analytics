import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DataDeletionService } from './data-deletion.service';
import { DeleteUserDataDto } from './dto/delete-user-data.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../database/entities/dashboard-user.entity';

@ApiTags('Admin / Data Deletion')
@Controller('v1/admin/data-deletion')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DataDeletionController {
  constructor(private readonly dataDeletionService: DataDeletionService) {}

  @Post('users')
  @ApiOperation({ summary: 'Purge all event data for a specified user_id or anonymous_id (ADMIN only)' })
  async deleteUserData(
    @Body() dto: DeleteUserDataDto,
    @Req() req: Request,
    @CurrentUser('sub') adminUserId: string,
  ) {
    const reqIp = req.ip || (req.headers['x-forwarded-for'] as string) || '';
    return this.dataDeletionService.deleteUserData(dto, adminUserId, reqIp);
  }
}
