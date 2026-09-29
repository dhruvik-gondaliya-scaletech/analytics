import { Module } from '@nestjs/common';
import { AnalyticsconfigController } from './analyticsconfig.controller';
import { AnalyticsconfigService } from './analyticsconfig.service';

@Module({
  controllers: [AnalyticsconfigController],
  providers: [AnalyticsconfigService]
})
export class AnalyticsconfigModule {}
