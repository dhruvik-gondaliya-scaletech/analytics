import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StatusService } from './status.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Get status info' })
  async getStatus() {
    return this.statusService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update status' })
  async createStatus(@Body() payload: any) {
    return this.statusService.create(payload);
  }
}
