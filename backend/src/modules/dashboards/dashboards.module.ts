import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { DashboardDefinition } from '../../database/entities/dashboard-definition.entity';
import { DashboardWidget } from '../../database/entities/dashboard-widget.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DashboardDefinition, DashboardWidget]),
    AuthModule,
  ],
  controllers: [DashboardsController],
  providers: [DashboardsService],
  exports: [DashboardsService],
})
export class DashboardsModule {}
