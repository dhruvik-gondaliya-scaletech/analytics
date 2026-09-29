import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { RedpandaModule } from '../redpanda/redpanda.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [RedpandaModule, ConfigModule],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
