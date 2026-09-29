import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DrilldownService } from './drilldown.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/drilldown')
@UseGuards(ApiAuthGuard)
export class DrilldownController {
  constructor(private readonly drilldownService: DrilldownService) {}

  @Get()
  @ApiOperation({ summary: 'Get drilldown analytics data' })
  async getDrilldown(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.drilldownService.getDrilldown(startDate, endDate);
  }
}
