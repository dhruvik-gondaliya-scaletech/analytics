import { Module } from '@nestjs/common';
import { RedpandaService } from './redpanda.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [RedpandaService],
  exports: [RedpandaService],
})
export class RedpandaModule {}
