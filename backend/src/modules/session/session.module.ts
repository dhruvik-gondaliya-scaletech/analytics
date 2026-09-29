import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [SessionController],
  providers: [SessionService]
})
export class SessionModule {}
