import { Module } from '@nestjs/common';
import { BreakdownController } from './breakdown.controller';
import { BreakdownService } from './breakdown.service';

@Module({
  controllers: [BreakdownController],
  providers: [BreakdownService]
})
export class BreakdownModule {}
