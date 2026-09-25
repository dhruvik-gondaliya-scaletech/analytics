import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { FunnelQueryDto } from './dto/funnel-query.dto';
import { RetentionQueryDto } from './dto/retention-query.dto';
import { EventsExplorerDto } from './dto/events-explorer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('v1/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overview high-level KPI metrics and trends' })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  async getOverview(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.analyticsService.getOverviewStats(dateFrom, dateTo);
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute semantic analytics time-series query' })
  async queryAnalytics(@Body() dto: AnalyticsQueryDto) {
    return this.analyticsService.executeAnalyticsQuery(dto);
  }

  @Post('funnel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate step-by-step conversion funnel' })
  async calculateFunnel(@Body() dto: FunnelQueryDto) {
    return this.analyticsService.executeFunnelQuery(dto);
  }

  @Post('retention')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate cohort retention heatmap matrix' })
  async calculateRetention(@Body() dto: RetentionQueryDto) {
    return this.analyticsService.executeRetentionQuery(dto);
  }

  @Get('events')
  @ApiOperation({ summary: 'Explore and search raw analytics events' })
  async exploreEvents(@Query() query: EventsExplorerDto) {
    return this.analyticsService.getEventsExplorer(query);
  }
}
