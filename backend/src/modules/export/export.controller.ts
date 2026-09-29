import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuthGuard } from '../auth/api-auth.guard';

@ApiTags('export')
@Controller('management/export')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  @ApiOperation({ summary: 'Get export info' })
  async getExport() {
    return this.exportService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update export' })
  async createExport(@Body() payload: any) {
    return this.exportService.create(payload);
  }
}
