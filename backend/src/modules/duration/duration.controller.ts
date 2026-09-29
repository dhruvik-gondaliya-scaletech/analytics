import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DurationService } from './duration.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/duration')
@UseGuards(ApiAuthGuard)
export class DurationController {
  constructor(private readonly durationService: DurationService) {}

  @Get()
  @ApiOperation({ summary: 'Get duration analytics data' })
  async getDuration(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.durationService.getDuration(startDate, endDate);
  }
}
