import { Module } from '@nestjs/common';
import { DurationController } from './duration.controller';
import { DurationService } from './duration.service';

@Module({
  controllers: [DurationController],
  providers: [DurationService]
})
export class DurationModule {}
