import { Module } from '@nestjs/common';
import { RetentionController } from './retention.controller';
import { RetentionService } from './retention.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [RetentionController],
  providers: [RetentionService]
})
export class RetentionModule {}
