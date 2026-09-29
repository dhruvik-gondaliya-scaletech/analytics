import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, ClickHouseClient } from '@clickhouse/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClickhouseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ClickhouseService.name);
  private client: ClickHouseClient;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      host: this.configService.get<string>('CLICKHOUSE_HOST') || 'http://localhost:8123',
      username: this.configService.get<string>('CLICKHOUSE_USER') || 'default',
      password: this.configService.get<string>('CLICKHOUSE_PASSWORD') || '',
      database: this.configService.get<string>('CLICKHOUSE_DATABASE') || 'analytics',
    });
  }

  async onModuleInit() {
    try {
      await this.client.ping();
      this.logger.log('Connected to ClickHouse');
    } catch (error) {
      this.logger.error('Failed to connect to ClickHouse', error);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  getClient(): ClickHouseClient {
    return this.client;
  }
}
