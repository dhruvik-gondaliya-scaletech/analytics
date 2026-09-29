import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConversionService } from './conversion.service';
import { ApiAuthGuard } from '../auth/api-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('analytics-query')
@ApiBearerAuth()
@Controller('query/conversion')
@UseGuards(ApiAuthGuard)
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Get()
  @ApiOperation({ summary: 'Get conversion analytics data' })
  async getConversion(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.conversionService.getConversion(startDate, endDate);
  }
}
