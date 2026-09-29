import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { SingleEventDto, BatchEventDto } from './dto/ingest-event.dto';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(ApiAuthGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('events')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Ingest events (single or batch)' })
  @ApiResponse({ status: 202, description: 'Events accepted for processing' })
  async ingestEvents(@Body() payload: any) {
    // Determine if it's a batch or single event
    if (payload.events && Array.isArray(payload.events)) {
      // It's a batch
      return this.ingestionService.processBatchEvents(payload.events);
    } else {
      // It's a single event
      return this.ingestionService.processSingleEvent(payload as SingleEventDto);
    }
  }
}
