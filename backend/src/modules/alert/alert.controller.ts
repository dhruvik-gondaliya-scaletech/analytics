import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AlertService } from './alert.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuthGuard } from '../auth/api-auth.guard';

@ApiTags('alert')
@Controller('management/alert')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @ApiOperation({ summary: 'Get alert info' })
  async getAlert() {
    return this.alertService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update alert' })
  async createAlert(@Body() payload: any) {
    return this.alertService.create(payload);
  }
}
