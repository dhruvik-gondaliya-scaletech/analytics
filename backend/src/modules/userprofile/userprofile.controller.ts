import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserprofileService } from './userprofile.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAuthGuard } from '../auth/api-auth.guard';

@ApiTags('userprofile')
@Controller('management/userprofile')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard)
export class UserprofileController {
  constructor(private readonly userprofileService: UserprofileService) {}

  @Get()
  @ApiOperation({ summary: 'Get userprofile info' })
  async getUserprofile() {
    return this.userprofileService.get();
  }

  @Post()
  @ApiOperation({ summary: 'Create or update userprofile' })
  async createUserprofile(@Body() payload: any) {
    return this.userprofileService.create(payload);
  }
}
