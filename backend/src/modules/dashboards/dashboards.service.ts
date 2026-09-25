import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardDefinition } from '../../database/entities/dashboard-definition.entity';
import { DashboardWidget } from '../../database/entities/dashboard-widget.entity';
import { InsightVisibility } from '../../database/entities/saved-insight.entity';
import { UserRole } from '../../database/entities/dashboard-user.entity';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { AddWidgetDto } from './dto/add-widget.dto';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(DashboardDefinition)
    private readonly dashboardRepository: Repository<DashboardDefinition>,
    @InjectRepository(DashboardWidget)
    private readonly widgetRepository: Repository<DashboardWidget>,
  ) {}

  async listDashboards(userId: string, role: UserRole) {
    const query = this.dashboardRepository
      .createQueryBuilder('dash')
      .leftJoinAndSelect('dash.ownerUser', 'owner')
      .leftJoinAndSelect('dash.widgets', 'widgets')
      .leftJoinAndSelect('widgets.insight', 'insight')
      .orderBy('dash.updatedAt', 'DESC');

    if (role !== UserRole.ADMIN) {
      query.where('dash.visibility = :shared OR dash.ownerUserId = :userId', {
        shared: InsightVisibility.SHARED,
        userId,
      });
    }

    return query.getMany();
  }

  async getDashboardById(id: string, userId: string, role: UserRole) {
    const dash = await this.dashboardRepository.findOne({
      where: { id },
      relations: ['ownerUser', 'widgets', 'widgets.insight'],
    });

    if (!dash) {
      throw new NotFoundException(`Dashboard with ID '${id}' not found`);
    }

    if (
      role !== UserRole.ADMIN &&
      dash.visibility === InsightVisibility.PRIVATE &&
      dash.ownerUserId !== userId
    ) {
      throw new ForbiddenException('You do not have permission to view this private dashboard');
    }

    return dash;
  }

  async createDashboard(dto: CreateDashboardDto, userId: string) {
    if (dto.is_default) {
      await this.dashboardRepository.update({}, { isDefault: false });
    }

    const dash = this.dashboardRepository.create({
      title: dto.title,
      description: dto.description || '',
      visibility: dto.visibility || InsightVisibility.SHARED,
      isDefault: dto.is_default || false,
      ownerUserId: userId,
    });

    return this.dashboardRepository.save(dash);
  }

  async updateDashboard(
    id: string,
    dto: Partial<CreateDashboardDto>,
    userId: string,
    role: UserRole,
  ) {
    const dash = await this.dashboardRepository.findOne({ where: { id } });
    if (!dash) {
      throw new NotFoundException(`Dashboard with ID '${id}' not found`);
    }

    if (role !== UserRole.ADMIN && dash.ownerUserId !== userId) {
      throw new ForbiddenException('You cannot update another user\'s dashboard');
    }

    if (dto.is_default) {
      await this.dashboardRepository.update({}, { isDefault: false });
    }

    if (dto.title !== undefined) dash.title = dto.title;
    if (dto.description !== undefined) dash.description = dto.description;
    if (dto.visibility !== undefined) dash.visibility = dto.visibility;
    if (dto.is_default !== undefined) dash.isDefault = dto.is_default;

    return this.dashboardRepository.save(dash);
  }

  async deleteDashboard(id: string, userId: string, role: UserRole) {
    const dash = await this.dashboardRepository.findOne({ where: { id } });
    if (!dash) {
      throw new NotFoundException(`Dashboard with ID '${id}' not found`);
    }

    if (role !== UserRole.ADMIN && dash.ownerUserId !== userId) {
      throw new ForbiddenException('You cannot delete another user\'s dashboard');
    }

    await this.dashboardRepository.remove(dash);
    return { message: 'Dashboard successfully deleted' };
  }

  async addWidget(dashboardId: string, dto: AddWidgetDto, userId: string, role: UserRole) {
    await this.getDashboardById(dashboardId, userId, role);

    const widget = this.widgetRepository.create({
      dashboardId,
      insightId: dto.insight_id || null,
      gridPosition: dto.grid_position,
    });

    return this.widgetRepository.save(widget);
  }

  async updateWidget(
    dashboardId: string,
    widgetId: string,
    dto: Partial<AddWidgetDto>,
    userId: string,
    role: UserRole,
  ) {
    await this.getDashboardById(dashboardId, userId, role);

    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId, dashboardId },
    });

    if (!widget) {
      throw new NotFoundException(`Widget '${widgetId}' not found on dashboard '${dashboardId}'`);
    }

    if (dto.insight_id !== undefined) widget.insightId = dto.insight_id;
    if (dto.grid_position !== undefined) widget.gridPosition = dto.grid_position;

    return this.widgetRepository.save(widget);
  }

  async removeWidget(dashboardId: string, widgetId: string, userId: string, role: UserRole) {
    await this.getDashboardById(dashboardId, userId, role);

    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId, dashboardId },
    });

    if (!widget) {
      throw new NotFoundException(`Widget '${widgetId}' not found`);
    }

    await this.widgetRepository.remove(widget);
    return { message: 'Widget removed successfully' };
  }
}
