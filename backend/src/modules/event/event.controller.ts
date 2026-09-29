import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/event')
@UseGuards(ApiAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({ summary: 'Get event analytics data' })
  async getEvent(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.eventService.getEvent(startDate, endDate);
  }
}
