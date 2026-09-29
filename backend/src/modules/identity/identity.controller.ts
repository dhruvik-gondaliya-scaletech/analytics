import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuthGuard } from '../auth/api-auth.guard';

@ApiTags('identity')
@Controller('management/identity')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard)
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get()
  @ApiOperation({ summary: 'Get identity info' })
  async getIdentity() {
    return this.identityService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update identity' })
  async createIdentity(@Body() payload: any) {
    return this.identityService.create(payload);
  }
}
