import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { RedpandaModule } from './modules/redpanda/redpanda.module';
import { ClickhouseModule } from './modules/clickhouse/clickhouse.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TypeOrmConnectionModule } from './database/typeorm-root.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnalyticsconfigModule } from './modules/analyticsconfig/analyticsconfig.module';
import { EventModule } from './modules/event/event.module';
import { IdentityModule } from './modules/identity/identity.module';
import { UserprofileModule } from './modules/userprofile/userprofile.module';
import { SessionModule } from './modules/session/session.module';
import { AcquisitionModule } from './modules/acquisition/acquisition.module';
import { RetentionModule } from './modules/retention/retention.module';
import { TrendModule } from './modules/trend/trend.module';
import { FunnelModule } from './modules/funnel/funnel.module';
import { ConversionModule } from './modules/conversion/conversion.module';
import { DropoffModule } from './modules/dropoff/dropoff.module';
import { DurationModule } from './modules/duration/duration.module';
import { StatusModule } from './modules/status/status.module';
import { BreakdownModule } from './modules/breakdown/breakdown.module';
import { ComparisonModule } from './modules/comparison/comparison.module';
import { FilterModule } from './modules/filter/filter.module';
import { DrilldownModule } from './modules/drilldown/drilldown.module';
import { ExportModule } from './modules/export/export.module';
import { AlertModule } from './modules/alert/alert.module';
import { HealthModule } from './modules/health/health.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmConnectionModule,
    DatabaseModule,
    RedpandaModule,
    ClickhouseModule,
    AuthModule,
    IngestionModule,
    DashboardModule,
    AnalyticsconfigModule,
    EventModule,
    IdentityModule,
    UserprofileModule,
    SessionModule,
    AcquisitionModule,
    RetentionModule,
    TrendModule,
    FunnelModule,
    ConversionModule,
    DropoffModule,
    DurationModule,
    StatusModule,
    BreakdownModule,
    ComparisonModule,
    FilterModule,
    DrilldownModule,
    ExportModule,
    AlertModule,
    HealthModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
