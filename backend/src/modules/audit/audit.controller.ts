import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuthGuard } from '../auth/api-auth.guard';

@ApiTags('audit')
@Controller('management/audit')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit info' })
  async getAudit() {
    return this.auditService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update audit' })
  async createAudit(@Body() payload: any) {
    return this.auditService.create(payload);
  }
}
