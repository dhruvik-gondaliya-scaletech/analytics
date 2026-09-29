import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from '../../database/entities/dashboard.entity';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
  ) {}

  async createDashboard(name: string, description?: string, is_public: boolean = false) {
    const dashboard = this.dashboardRepository.create({ name, description, is_public });
    return this.dashboardRepository.save(dashboard);
  }

  async getAllDashboards() {
    return this.dashboardRepository.find({ relations: ['panels'] });
  }

  async getDashboardById(id: string) {
    const dashboard = await this.dashboardRepository.findOne({ 
      where: { id },
      relations: ['panels']
    });
    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }
    return dashboard;
  }
}
