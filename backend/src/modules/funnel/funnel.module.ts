import { Module } from '@nestjs/common';
import { FunnelController } from './funnel.controller';
import { FunnelService } from './funnel.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [FunnelController],
  providers: [FunnelService]
})
export class FunnelModule {}
