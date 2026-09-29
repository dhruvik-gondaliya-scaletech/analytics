import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RetentionService } from './retention.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/retention')
@UseGuards(ApiAuthGuard)
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Get()
  @ApiOperation({ summary: 'Calculate user retention cohorts' })
  @ApiQuery({ name: 'cohortEvent', required: true, type: String })
  @ApiQuery({ name: 'returnEvent', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async getRetention(
    @Query('cohortEvent') cohortEvent: string,
    @Query('returnEvent') returnEvent: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.retentionService.getRetention(cohortEvent, returnEvent, startDate, endDate);
  }
}
