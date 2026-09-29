import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FilterService } from './filter.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuthGuard } from '../auth/api-auth.guard';

@ApiTags('filter')
@Controller('management/filter')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard)
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Get()
  @ApiOperation({ summary: 'Get filter info' })
  async getFilter() {
    return this.filterService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update filter' })
  async createFilter(@Body() payload: any) {
    return this.filterService.create(payload);
  }
}
