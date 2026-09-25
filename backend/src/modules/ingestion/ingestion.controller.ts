import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { IngestEventDto } from './dto/ingest-event.dto';
import { IngestBatchDto } from './dto/ingest-batch.dto';
import { IngestionKeyGuard } from './guards/ingestion-key.guard';

@ApiTags('Ingestion')
@Controller()
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('v1/ingest')
  @UseGuards(IngestionKeyGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ingest single event' })
  @ApiResponse({ status: 202, description: 'Event accepted and queued for write' })
  async ingestSingle(@Body() dto: IngestEventDto, @Req() req: Request) {
    const reqIp = req.ip || (req.headers['x-forwarded-for'] as string) || '';
    const reqUA = (req.headers['user-agent'] as string) || '';
    return this.ingestionService.processSingleEvent(dto, reqIp, reqUA);
  }

  @Post('v1/ingest/batch')
  @UseGuards(IngestionKeyGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ingest batch of events' })
  @ApiResponse({ status: 202, description: 'Batch accepted and queued for write' })
  async ingestBatch(@Body() dto: IngestBatchDto, @Req() req: Request) {
    const reqIp = req.ip || (req.headers['x-forwarded-for'] as string) || '';
    const reqUA = (req.headers['user-agent'] as string) || '';
    return this.ingestionService.processBatchEvents(dto, reqIp, reqUA);
  }

  // Compatibility alias for legacy webhooks
  @Post('webhook')
  @UseGuards(IngestionKeyGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Legacy webhook alias for single event ingestion' })
  async webhookAlias(@Body() dto: IngestEventDto, @Req() req: Request) {
    const reqIp = req.ip || (req.headers['x-forwarded-for'] as string) || '';
    const reqUA = (req.headers['user-agent'] as string) || '';
    return this.ingestionService.processSingleEvent(dto, reqIp, reqUA);
  }
}
