import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TrendService } from './trend.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/trends')
@UseGuards(ApiAuthGuard)
export class TrendController {
  constructor(private readonly trendService: TrendService) {}

  @Get()
  @ApiOperation({ summary: 'Get event trends over time' })
  @ApiQuery({ name: 'eventName', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'ISO Date string' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'ISO Date string' })
  @ApiQuery({ name: 'interval', required: false, enum: ['day', 'hour', 'minute'] })
  async getTrend(
    @Query('eventName') eventName: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval?: 'day' | 'hour' | 'minute',
  ) {
    return this.trendService.getEventTrend(eventName, startDate, endDate, interval || 'day');
  }
}
