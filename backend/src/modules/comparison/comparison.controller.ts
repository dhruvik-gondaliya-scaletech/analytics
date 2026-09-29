import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ComparisonService } from './comparison.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/comparison')
@UseGuards(ApiAuthGuard)
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Get()
  @ApiOperation({ summary: 'Compare event occurrences between two date ranges' })
  @ApiQuery({ name: 'eventName', required: true, type: String })
  @ApiQuery({ name: 'baseStartDate', required: true, type: String, description: 'ISO Date string' })
  @ApiQuery({ name: 'baseEndDate', required: true, type: String, description: 'ISO Date string' })
  @ApiQuery({ name: 'compareStartDate', required: true, type: String, description: 'ISO Date string' })
  @ApiQuery({ name: 'compareEndDate', required: true, type: String, description: 'ISO Date string' })
  async getComparison(
    @Query('eventName') eventName: string,
    @Query('baseStartDate') baseStartDate: string,
    @Query('baseEndDate') baseEndDate: string,
    @Query('compareStartDate') compareStartDate: string,
    @Query('compareEndDate') compareEndDate: string,
  ) {
    return this.comparisonService.getComparison(eventName, baseStartDate, baseEndDate, compareStartDate, compareEndDate);
  }
}
