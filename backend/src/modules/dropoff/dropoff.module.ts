import { Module } from '@nestjs/common';
import { DropoffController } from './dropoff.controller';
import { DropoffService } from './dropoff.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [DropoffController],
  providers: [DropoffService]
})
export class DropoffModule {}
