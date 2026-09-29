import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kafka, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { ClickhouseService } from '../clickhouse/clickhouse.service';
import { UserProfile } from '../../database/entities/user-profile.entity';
import { SessionMetadata } from '../../database/entities/session-metadata.entity';

@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly clickhouseService: ClickhouseService,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(SessionMetadata)
    private readonly sessionMetadataRepository: Repository<SessionMetadata>,
  ) {
    const brokers = [this.configService.get<string>('REDPANDA_BROKERS') || 'localhost:19092'];
    this.kafka = new Kafka({
      clientId: 'analytics-worker',
      brokers,
    });
    this.consumer = this.kafka.consumer({ groupId: 'analytics-clickhouse-consumer' });
  }

  async onModuleInit() {
    this.startConsumer().catch((err) => {
      this.logger.error('Failed to start Redpanda consumer worker', err);
    });
  }

  async onModuleDestroy() {
    this.isRunning = false;
    try {
      await this.consumer.disconnect();
    } catch {
      // ignore
    }
  }

  private async startConsumer() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: 'analytics.events',
        fromBeginning: true,
      });

      this.isRunning = true;
      this.logger.log('Analytics Worker successfully connected and subscribed to analytics.events');

      await this.consumer.run({
        eachBatchAutoResolve: true,
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
          if (!isRunning() || isStale()) return;

          const rowsToInsert: any[] = [];

          for (const message of batch.messages) {
            if (!message.value) continue;
            try {
              const event = JSON.parse(message.value.toString());
              const formattedRow = this.formatEventForClickhouse(event);
              if (formattedRow) {
                rowsToInsert.push(formattedRow);
              }
              // Update postgres profile and session metadata
              this.updatePostgresMetadata(event).catch((err) => {
                this.logger.warn(`Failed to update metadata for event: ${err.message}`);
              });

              resolveOffset(message.offset);
              await heartbeat();
            } catch (err: any) {
              this.logger.error(`Error parsing message at offset ${message.offset}: ${err.message}`);
            }
          }

          if (rowsToInsert.length > 0) {
            await this.insertBatchToClickhouse(rowsToInsert);
          }
        },
      });
    } catch (error) {
      this.logger.error('Error in Redpanda worker consumer execution', error);
    }
  }

  private formatEventForClickhouse(event: any) {
    try {
      const eventId = this.toValidUuid(event.event_id);
      const timestamp = this.toClickHouseDateTime(event.timestamp || event.occurred_at || event.received_at);
      const receivedAt = this.toClickHouseDateTime(event.received_at || event.timestamp || event.occurred_at);

      const ctx = event.context || {};
      const dev = ctx.device || {};
      const req = ctx.request || {};
      const loc = ctx.location || {};

      return {
        event_id: eventId,
        environment: event.environment || 'production',
        event_name: event.event_name || 'unknown',
        event_version: event.event_version || 1,
        timestamp,
        received_at: receivedAt,
        user_id: ctx.user_id || event.user_id || '',
        anonymous_id: ctx.anonymous_id || event.anonymous_id || '',
        session_id: ctx.session_id || event.session_id || '',
        ip: req.ip || ctx.ip || '',
        user_agent: dev.user_agent || req.user_agent || ctx.user_agent || '',
        device_type: dev.device_type || dev.platform || '',
        browser: dev.browser || '',
        os: dev.os || dev.platform || '',
        country: loc.country || '',
        event_data: typeof event.properties === 'object' ? JSON.stringify(event.properties) : (event.event_data || '{}'),
        context: typeof ctx === 'object' ? JSON.stringify(ctx) : '{}',
        ingestion_source: event.ingestion_source || 'api',
      };
    } catch (err) {
      this.logger.error('Error formatting event for ClickHouse', err);
      return null;
    }
  }

  private async insertBatchToClickhouse(rows: any[]) {
    try {
      const client = this.clickhouseService.getClient();
      await client.insert({
        table: 'analytics_events',
        values: rows,
        format: 'JSONEachRow',
      });
      this.logger.log(`Worker: Successfully inserted ${rows.length} event(s) into ClickHouse`);
    } catch (error: any) {
      this.logger.error(`Worker: Failed to insert batch of ${rows.length} events into ClickHouse: ${error.message}`, error.stack);
    }
  }

  private async updatePostgresMetadata(event: any) {
    const userId = event.context?.user_id || event.user_id;
    const now = new Date();

    if (userId) {
      try {
        const existing = await this.userProfileRepository.findOne({ where: { user_id: userId } });
        if (existing) {
          existing.last_seen_at = now;
          if (event.properties) {
            existing.traits = { ...(existing.traits || {}), ...event.properties };
          }
          await this.userProfileRepository.save(existing);
        } else {
          const profile = this.userProfileRepository.create({
            user_id: userId,
            project_user_id: userId,
            first_seen_at: now,
            last_seen_at: now,
            traits: event.properties || {},
          });
          await this.userProfileRepository.save(profile);
        }
      } catch {
        // Silently continue
      }
    }

    const sessionId = event.context?.session_id || event.session_id;
    if (sessionId) {
      try {
        const existingSession = await this.sessionMetadataRepository.findOne({ where: { session_id: sessionId } });
        if (existingSession) {
          existingSession.ended_at = now;
          await this.sessionMetadataRepository.save(existingSession);
        } else {
          const session = this.sessionMetadataRepository.create({
            session_id: sessionId,
            user_id: userId || undefined,
            anonymous_id: event.context?.anonymous_id || event.anonymous_id,
            started_at: now,
            ended_at: now,
            acquisition: event.context?.acquisition || {},
          });
          await this.sessionMetadataRepository.save(session);
        }
      } catch {
        // Silently continue
      }
    }
  }

  private toValidUuid(id?: string): string {
    if (!id) return uuidv4();
    const clean = id.startsWith('evt_') ? id.slice(4) : id;
    if (/^[0-9a-fA-F]{32}$/.test(clean)) {
      return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
    }
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(clean)) {
      return clean;
    }
    return uuidv4();
  }

  private toClickHouseDateTime(dateStr?: string | Date): string {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (isNaN(d.getTime())) return new Date().toISOString().replace('T', ' ').replace('Z', '');
    return d.toISOString().replace('T', ' ').replace('Z', '');
  }
}
