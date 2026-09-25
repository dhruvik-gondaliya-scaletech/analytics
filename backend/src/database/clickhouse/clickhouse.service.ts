import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickhouseService implements OnModuleInit {
  private readonly logger = new Logger(ClickhouseService.name);
  private client: ClickHouseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('CLICKHOUSE_URL') || 'http://localhost:8123';
    const username = this.configService.get<string>('CLICKHOUSE_USER') || 'default';
    const password = this.configService.get<string>('CLICKHOUSE_PASSWORD') || '';

    this.client = createClient({
      url,
      username,
      password,
      database: 'default',
      clickhouse_settings: {
        date_time_input_format: 'best_effort',
      },
    });
  }

  async onModuleInit() {
    try {
      await this.ensureDatabaseAndTable();
      this.logger.log('ClickHouse initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize ClickHouse:', error);
    }
  }

  getClient(): ClickHouseClient {
    return this.client;
  }

  async ensureDatabaseAndTable() {
    // Ensure analytics database exists
    await this.client.command({
      query: `CREATE DATABASE IF NOT EXISTS analytics`,
    });

    const retentionDays = parseInt(
      this.configService.get<string>('EVENT_RETENTION_DAYS') || '365',
      10,
    );
    const safeRetention = Math.min(Math.max(1, retentionDays), 365);

    // DDL for analytics_events table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS analytics.analytics_events
      (
          event_id UUID,
          environment LowCardinality(String) DEFAULT 'production',
          event_name LowCardinality(String),
          event_version UInt16 DEFAULT 1,

          timestamp DateTime64(3, 'UTC'),
          received_at DateTime64(3, 'UTC'),

          user_id String DEFAULT '',
          anonymous_id String DEFAULT '',
          session_id String DEFAULT '',

          ip String DEFAULT '',
          user_agent String DEFAULT '',
          device_type LowCardinality(String) DEFAULT '',
          browser LowCardinality(String) DEFAULT '',
          os LowCardinality(String) DEFAULT '',
          country LowCardinality(String) DEFAULT '',

          event_data String DEFAULT '{}',
          context String DEFAULT '{}',

          ingestion_source LowCardinality(String) DEFAULT 'api'
      )
      ENGINE = MergeTree()
      PARTITION BY toYYYYMM(timestamp)
      ORDER BY (event_name, timestamp, user_id, event_id)
      TTL toDateTime(timestamp) + INTERVAL ${safeRetention} DAY DELETE;
    `;

    await this.client.command({ query: createTableQuery });
  }

  async query<T = unknown>(query: string, query_params?: Record<string, any>) {
    const resultSet = await this.client.query({
      query,
      query_params,
      format: 'JSONEachRow',
    });
    return resultSet.json<T>();
  }

  async insert(table: string, values: Record<string, any>[]) {
    if (values.length === 0) return;
    await this.client.insert({
      table: `analytics.${table}`,
      values,
      format: 'JSONEachRow',
      clickhouse_settings: {
        date_time_input_format: 'best_effort',
      },
    });
  }
}
