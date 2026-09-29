import { Module } from '@nestjs/common';
import { DrilldownController } from './drilldown.controller';
import { DrilldownService } from './drilldown.service';

@Module({
  controllers: [DrilldownController],
  providers: [DrilldownService]
})
export class DrilldownModule {}
