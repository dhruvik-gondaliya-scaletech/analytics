import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AnalyticsconfigService } from './analyticsconfig.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuthGuard } from '../auth/api-auth.guard';

@ApiTags('analyticsconfig')
@Controller('management/analyticsconfig')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard)
export class AnalyticsconfigController {
  constructor(private readonly analyticsconfigService: AnalyticsconfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get analyticsconfig info' })
  async getAnalyticsconfig() {
    return this.analyticsconfigService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update analyticsconfig' })
  async createAnalyticsconfig(@Body() payload: any) {
    return this.analyticsconfigService.create(payload);
  }
}
