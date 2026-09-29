import { Module } from '@nestjs/common';
import { DrilldownController } from './drilldown.controller';
import { DrilldownService } from './drilldown.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [DrilldownController],
  providers: [DrilldownService]
})
export class DrilldownModule {}
