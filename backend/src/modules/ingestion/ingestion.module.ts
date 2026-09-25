import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { IngestionWorker } from './worker/ingestion.worker';
import { IngestionApiKey } from '../../database/entities/ingestion-api-key.entity';
import { EventDefinition } from '../../database/entities/event-definition.entity';
import { IngestionKeyGuard } from './guards/ingestion-key.guard';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analytics-ingestion',
    }),
    TypeOrmModule.forFeature([IngestionApiKey, EventDefinition]),
  ],
  controllers: [IngestionController],
  providers: [IngestionService, IngestionWorker, IngestionKeyGuard],
  exports: [IngestionService],
})
export class IngestionModule {}
