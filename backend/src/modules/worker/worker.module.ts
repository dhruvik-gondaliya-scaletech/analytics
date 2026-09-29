import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerService } from './worker.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { UserProfile } from '../../database/entities/user-profile.entity';
import { SessionMetadata } from '../../database/entities/session-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, SessionMetadata]),
    ClickhouseModule,
  ],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}
