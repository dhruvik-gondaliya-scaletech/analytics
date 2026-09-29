import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AcquisitionService } from './acquisition.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuthGuard } from '../auth/api-auth.guard';

@ApiTags('acquisition')
@Controller('management/acquisition')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard)
export class AcquisitionController {
  constructor(private readonly acquisitionService: AcquisitionService) {}

  @Get()
  @ApiOperation({ summary: 'Get acquisition info' })
  async getAcquisition() {
    return this.acquisitionService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update acquisition' })
  async createAcquisition(@Body() payload: any) {
    return this.acquisitionService.create(payload);
  }
}
