import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DropoffService } from './dropoff.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/dropoff')
@UseGuards(ApiAuthGuard)
export class DropoffController {
  constructor(private readonly dropoffService: DropoffService) {}

  @Get()
  @ApiOperation({ summary: 'Get dropoff analytics data' })
  async getDropoff(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dropoffService.getDropoff(startDate, endDate);
  }
}
