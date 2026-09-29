import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/session')
@UseGuards(ApiAuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'Get session analytics data' })
  async getSession(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.sessionService.getSession(startDate, endDate);
  }
}
