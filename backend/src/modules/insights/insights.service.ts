import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedInsight, InsightVisibility } from '../../database/entities/saved-insight.entity';
import { UserRole } from '../../database/entities/dashboard-user.entity';
import { CreateInsightDto } from './dto/create-insight.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(SavedInsight)
    private readonly insightRepository: Repository<SavedInsight>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async listInsights(userId: string, role: UserRole) {
    const query = this.insightRepository
      .createQueryBuilder('insight')
      .leftJoinAndSelect('insight.ownerUser', 'owner')
      .orderBy('insight.updatedAt', 'DESC');

    if (role !== UserRole.ADMIN) {
      query.where('insight.visibility = :shared OR insight.ownerUserId = :userId', {
        shared: InsightVisibility.SHARED,
        userId,
      });
    }

    return query.getMany();
  }

  async getInsightById(id: string, userId: string, role: UserRole) {
    const insight = await this.insightRepository.findOne({
      where: { id },
      relations: ['ownerUser'],
    });

    if (!insight) {
      throw new NotFoundException(`Saved insight with ID '${id}' not found`);
    }

    if (
      role !== UserRole.ADMIN &&
      insight.visibility === InsightVisibility.PRIVATE &&
      insight.ownerUserId !== userId
    ) {
      throw new ForbiddenException('You do not have permission to view this private insight');
    }

    // Execute associated analytics query
    let queryResults: any = null;
    if (insight.chartConfig && typeof insight.chartConfig === 'object') {
      try {
        queryResults = await this.analyticsService.executeAnalyticsQuery(
          insight.chartConfig as any,
        );
      } catch (err) {
        queryResults = { error: 'Failed to execute insight query' };
      }
    }

    return {
      ...insight,
      execution_result: queryResults,
    };
  }

  async createInsight(dto: CreateInsightDto, userId: string) {
    const insight = this.insightRepository.create({
      title: dto.title,
      description: dto.description || '',
      type: dto.type || 'time_series',
      chartConfig: dto.chart_config,
      visibility: dto.visibility || InsightVisibility.SHARED,
      isPinnedToOverview: dto.is_pinned_to_overview || false,
      ownerUserId: userId,
    });

    return this.insightRepository.save(insight);
  }

  async updateInsight(
    id: string,
    dto: Partial<CreateInsightDto>,
    userId: string,
    role: UserRole,
  ) {
    const insight = await this.insightRepository.findOne({ where: { id } });
    if (!insight) {
      throw new NotFoundException(`Saved insight with ID '${id}' not found`);
    }

    if (role !== UserRole.ADMIN && insight.ownerUserId !== userId) {
      throw new ForbiddenException('You cannot update another user\'s insight');
    }

    if (dto.title !== undefined) insight.title = dto.title;
    if (dto.description !== undefined) insight.description = dto.description;
    if (dto.type !== undefined) insight.type = dto.type;
    if (dto.chart_config !== undefined) insight.chartConfig = dto.chart_config;
    if (dto.visibility !== undefined) insight.visibility = dto.visibility;
    if (dto.is_pinned_to_overview !== undefined)
      insight.isPinnedToOverview = dto.is_pinned_to_overview;

    return this.insightRepository.save(insight);
  }

  async deleteInsight(id: string, userId: string, role: UserRole) {
    const insight = await this.insightRepository.findOne({ where: { id } });
    if (!insight) {
      throw new NotFoundException(`Saved insight with ID '${id}' not found`);
    }

    if (role !== UserRole.ADMIN && insight.ownerUserId !== userId) {
      throw new ForbiddenException('You cannot delete another user\'s insight');
    }

    await this.insightRepository.remove(insight);
    return { message: 'Insight successfully deleted' };
  }
}
