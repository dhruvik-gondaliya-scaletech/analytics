import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { ClickhouseService } from '../../database/clickhouse/clickhouse.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clickhouseService: ClickhouseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health status' })
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  getLiveness() {
    return { status: 'live' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe checking DB & ClickHouse connections' })
  async getReadiness() {
    let postgresOk = false;
    let clickhouseOk = false;

    try {
      postgresOk = this.dataSource.isInitialized;
    } catch {}

    try {
      await this.clickhouseService.query('SELECT 1');
      clickhouseOk = true;
    } catch {}

    const isReady = postgresOk && clickhouseOk;

    return {
      status: isReady ? 'ready' : 'degraded',
      postgres: postgresOk ? 'connected' : 'disconnected',
      clickhouse: clickhouseOk ? 'connected' : 'disconnected',
    };
  }
}
