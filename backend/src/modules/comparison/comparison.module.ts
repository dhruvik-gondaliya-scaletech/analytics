import { Module } from '@nestjs/common';
import { ComparisonController } from './comparison.controller';
import { ComparisonService } from './comparison.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [ComparisonController],
  providers: [ComparisonService]
})
export class ComparisonModule {}
