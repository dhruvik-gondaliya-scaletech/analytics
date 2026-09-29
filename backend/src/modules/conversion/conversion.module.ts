import { Module } from '@nestjs/common';
import { ConversionController } from './conversion.controller';
import { ConversionService } from './conversion.service';
import { ClickhouseModule } from '../clickhouse/clickhouse.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ClickhouseModule, ConfigModule],
  controllers: [ConversionController],
  providers: [ConversionService]
})
export class ConversionModule {}
