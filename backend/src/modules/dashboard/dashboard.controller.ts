import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

class CreateDashboardDto {
  name: string;
  description?: string;
  is_public?: boolean;
}

@ApiTags('dashboards')
@ApiBearerAuth()
@Controller('dashboards')
@UseGuards(ApiAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dashboard' })
  async createDashboard(@Body() dto: CreateDashboardDto) {
    return this.dashboardService.createDashboard(dto.name, dto.description, dto.is_public);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dashboards' })
  async getAllDashboards() {
    return this.dashboardService.getAllDashboards();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a dashboard by ID' })
  async getDashboardById(@Param('id') id: string) {
    return this.dashboardService.getDashboardById(id);
  }
}
