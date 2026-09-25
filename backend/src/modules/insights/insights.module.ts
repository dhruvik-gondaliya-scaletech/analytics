import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { SavedInsight } from '../../database/entities/saved-insight.entity';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedInsight]),
    AuthModule,
    AnalyticsModule,
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
