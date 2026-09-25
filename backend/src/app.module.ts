import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConnectionModule } from './database/typeorm-root.module';
import { ClickhouseModule } from './database/clickhouse/clickhouse.module';
import { QueueRootModule } from './database/queue/queue-root.module';
import { AuthModule } from './modules/auth/auth.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { RegistryModule } from './modules/registry/registry.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { InsightsModule } from './modules/insights/insights.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { ExportsModule } from './modules/exports/exports.module';
import { DataDeletionModule } from './modules/data-deletion/data-deletion.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HealthModule } from './modules/health/health.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmConnectionModule,
    ClickhouseModule,
    QueueRootModule,
    AuthModule,
    IngestionModule,
    RegistryModule,
    AnalyticsModule,
    InsightsModule,
    DashboardsModule,
    ExportsModule,
    DataDeletionModule,
    SettingsModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
