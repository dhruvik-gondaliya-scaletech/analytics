import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get health info' })
  async getHealth() {
    return this.healthService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update health' })
  async createHealth(@Body() payload: any) {
    return this.healthService.create(payload);
  }
}
