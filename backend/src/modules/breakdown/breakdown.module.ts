import { Module } from '@nestjs/common';
import { BreakdownController } from './breakdown.controller';
import { BreakdownService } from './breakdown.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [BreakdownController],
  providers: [BreakdownService]
})
export class BreakdownModule {}
