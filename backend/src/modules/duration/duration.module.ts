import { Module } from '@nestjs/common';
import { DurationController } from './duration.controller';
import { DurationService } from './duration.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [DurationController],
  providers: [DurationService]
})
export class DurationModule {}
