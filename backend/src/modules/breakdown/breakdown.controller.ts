import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BreakdownService } from './breakdown.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/breakdown')
@UseGuards(ApiAuthGuard)
export class BreakdownController {
  constructor(private readonly breakdownService: BreakdownService) {}

  @Get()
  @ApiOperation({ summary: 'Get breakdown analytics data' })
  async getBreakdown(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.breakdownService.getBreakdown(startDate, endDate);
  }
}
