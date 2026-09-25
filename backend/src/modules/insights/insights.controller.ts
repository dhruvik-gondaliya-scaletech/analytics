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
import { InsightsService } from './insights.service';
import { CreateInsightDto } from './dto/create-insight.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../database/entities/dashboard-user.entity';

@ApiTags('Saved Insights')
@Controller('v1/insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'List saved insights' })
  async list(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.insightsService.listInsights(userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get saved insight details and execute its query' })
  async get(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.insightsService.getInsightById(id, userId, role);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new saved insight' })
  async create(
    @Body() dto: CreateInsightDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.insightsService.createInsight(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing saved insight' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateInsightDto>,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.insightsService.updateInsight(id, dto, userId, role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved insight' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.insightsService.deleteInsight(id, userId, role);
  }
}
