import { Controller, Get, Query, Res, Req, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { EventsExplorerDto } from '../analytics/dto/events-explorer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Exports')
@Controller('v1/analytics/events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('export.csv')
  @ApiOperation({ summary: 'Export matching analytics events as CSV file' })
  async exportCsv(
    @Query() dto: EventsExplorerDto,
    @Res() res: Response,
    @Req() req: Request,
    @CurrentUser('sub') userId: string,
  ) {
    const reqIp = req.ip || (req.headers['x-forwarded-for'] as string) || '';
    return this.exportsService.exportEventsCsv(dto, res, userId, reqIp);
  }
}
