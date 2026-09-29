import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule {}
