import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FunnelService } from './funnel.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/funnel')
@UseGuards(ApiAuthGuard)
export class FunnelController {
  constructor(private readonly funnelService: FunnelService) {}

  @Get()
  @ApiOperation({ summary: 'Calculate funnel conversion rates' })
  @ApiQuery({ name: 'steps', required: true, type: [String], description: 'List of event names in order' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'window', required: false, type: Number, description: 'Conversion window in minutes (default 60)' })
  async getFunnel(
    @Query('steps') steps: string[] | string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('window') window?: number,
  ) {
    const stepsArray = Array.isArray(steps) 
      ? steps 
      : (typeof steps === 'string' ? steps.split(',').map(s => s.trim()).filter(Boolean) : []);
    return this.funnelService.getFunnel(stepsArray, startDate, endDate, window || 60);
  }
}
