import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { AddWidgetDto } from './dto/add-widget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../database/entities/dashboard-user.entity';

@ApiTags('Dashboards')
@Controller('v1/dashboards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  @ApiOperation({ summary: 'List dashboards' })
  async list(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.dashboardsService.listDashboards(userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard with populated widgets' })
  async get(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.dashboardsService.getDashboardById(id, userId, role);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new dashboard' })
  async create(
    @Body() dto: CreateDashboardDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.dashboardsService.createDashboard(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update dashboard' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDashboardDto>,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.dashboardsService.updateDashboard(id, dto, userId, role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dashboard' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.dashboardsService.deleteDashboard(id, userId, role);
  }

  @Post(':id/widgets')
  @ApiOperation({ summary: 'Add widget to dashboard' })
  async addWidget(
    @Param('id') dashboardId: string,
    @Body() dto: AddWidgetDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.dashboardsService.addWidget(dashboardId, dto, userId, role);
  }

  @Put(':id/widgets/:widgetId')
  @ApiOperation({ summary: 'Update widget on dashboard' })
  async updateWidget(
    @Param('id') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Body() dto: Partial<AddWidgetDto>,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.dashboardsService.updateWidget(dashboardId, widgetId, dto, userId, role);
  }

  @Delete(':id/widgets/:widgetId')
  @ApiOperation({ summary: 'Remove widget from dashboard' })
  async removeWidget(
    @Param('id') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.dashboardsService.removeWidget(dashboardId, widgetId, userId, role);
  }
}
