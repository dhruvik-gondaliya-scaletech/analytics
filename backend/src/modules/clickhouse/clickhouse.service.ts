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
    return new Proxy(this.client, {
      get: (target, prop) => {
        if (prop === 'query') {
          return async (params: any) => {
            if (params.query_params) {
              const formattedParams = { ...params.query_params };
              for (const key of Object.keys(formattedParams)) {
                if (typeof formattedParams[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(formattedParams[key])) {
                  // Format '2026-09-29T08:39:09.970Z' to '2026-09-29 08:39:09'
                  formattedParams[key] = formattedParams[key].substring(0, 19).replace('T', ' ');
                }
              }
              params.query_params = formattedParams;
            }
            return target.query(params);
          };
        }
        const val = (target as any)[prop];
        return typeof val === 'function' ? val.bind(target) : val;
      }
    });
  }
}
