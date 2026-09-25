import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickhouseService } from '../../../database/clickhouse/clickhouse.service';
import { NormalizedEvent } from '../ingestion.service';
import { EventDefinition, EventStatus } from '../../../database/entities/event-definition.entity';

@Processor('analytics-ingestion', { concurrency: 10 })
export class IngestionWorker extends WorkerHost {
  private readonly logger = new Logger(IngestionWorker.name);
  private eventBatch: NormalizedEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly batchSize = 500;
  private readonly flushIntervalMs = 1000;

  constructor(
    private readonly clickhouseService: ClickhouseService,
    @InjectRepository(EventDefinition)
    private readonly eventDefRepository: Repository<EventDefinition>,
  ) {
    super();
    this.startFlushTimer();
  }

  async process(job: Job<NormalizedEvent>): Promise<void> {
    const event = job.data;
    this.eventBatch.push(event);

    // Auto-discover unregistered events in background
    this.autoDiscoverEvent(event.event_name, event.timestamp).catch(() => {});

    if (this.eventBatch.length >= this.batchSize) {
      await this.flushBatch();
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.eventBatch.length > 0) {
        this.flushBatch().catch((err) => {
          this.logger.error('Error during scheduled batch flush:', err);
        });
      }
    }, this.flushIntervalMs);
  }

  private async flushBatch() {
    if (this.eventBatch.length === 0) return;

    const currentBatch = [...this.eventBatch];
    this.eventBatch = [];

    try {
      await this.clickhouseService.insert('analytics_events', currentBatch);
      this.logger.debug(`Successfully inserted batch of ${currentBatch.length} events into ClickHouse.`);
    } catch (err) {
      this.logger.error(`Failed to insert batch of ${currentBatch.length} events into ClickHouse:`, err);
      // Re-queue or throw so BullMQ handles backoff
      throw err;
    }
  }

  private async autoDiscoverEvent(eventName: string, timestampISO: string) {
    try {
      const existing = await this.eventDefRepository.findOne({
        where: { eventName },
      });

      const eventDate = new Date(timestampISO);

      if (!existing) {
        const newDef = this.eventDefRepository.create({
          eventName,
          displayName: eventName,
          category: 'discovered',
          status: EventStatus.UNREGISTERED,
          firstSeenAt: eventDate,
          lastSeenAt: eventDate,
        });
        await this.eventDefRepository.save(newDef);
      } else {
        existing.lastSeenAt = new Date();
        await this.eventDefRepository.save(existing);
      }
    } catch {
      // Ignore discovery errors during concurrent worker processing
    }
  }
}
