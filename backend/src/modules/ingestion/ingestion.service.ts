import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { IngestEventDto } from './dto/ingest-event.dto';
import { IngestBatchDto } from './dto/ingest-batch.dto';

export interface NormalizedEvent {
  event_id: string;
  environment: string;
  event_name: string;
  event_version: number;
  timestamp: string;
  received_at: string;
  user_id: string;
  anonymous_id: string;
  session_id: string;
  ip: string;
  user_agent: string;
  device_type: string;
  browser: string;
  os: string;
  country: string;
  event_data: string;
  context: string;
  ingestion_source: string;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(@InjectQueue('analytics-ingestion') private readonly queue: Queue) {}

  normalizeEvent(dto: IngestEventDto, requestIp?: string, requestUserAgent?: string): NormalizedEvent {
    const eventId = dto.event_id || uuidv4();
    const ctx = dto.context || {};
    const nowISO = new Date().toISOString();
    const timestampISO = ctx.timestamp ? new Date(ctx.timestamp).toISOString() : nowISO;

    const eventDataObj = dto.event_data || {};

    return {
      event_id: eventId,
      environment: 'production',
      event_name: dto.event_name,
      event_version: dto.event_version || 1,
      timestamp: timestampISO,
      received_at: nowISO,
      user_id: ctx.user_id || '',
      anonymous_id: ctx.anonymous_id || '',
      session_id: ctx.session_id || '',
      ip: ctx.ip || requestIp || '',
      user_agent: ctx.user_agent || requestUserAgent || '',
      device_type: ctx.device_type || '',
      browser: ctx.browser || '',
      os: ctx.os || '',
      country: ctx.country || '',
      event_data: JSON.stringify(eventDataObj),
      context: JSON.stringify(ctx),
      ingestion_source: 'api',
    };
  }

  async processSingleEvent(dto: IngestEventDto, reqIp?: string, reqUserAgent?: string) {
    const normalized = this.normalizeEvent(dto, reqIp, reqUserAgent);

    await this.queue.add('ingest-event', normalized, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    return {
      event_id: normalized.event_id,
      status: 'queued',
    };
  }

  async processBatchEvents(dto: IngestBatchDto, reqIp?: string, reqUserAgent?: string) {
    const normalizedList = dto.events.map((e) => this.normalizeEvent(e, reqIp, reqUserAgent));

    const jobs = normalizedList.map((evt) => ({
      name: 'ingest-event',
      data: evt,
      opts: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }));

    await this.queue.addBulk(jobs);

    return {
      accepted_count: normalizedList.length,
      event_ids: normalizedList.map((e) => e.event_id),
      status: 'queued',
    };
  }
}
