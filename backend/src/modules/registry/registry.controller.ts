import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RegistryService } from './registry.service';
import { CreateEventDefDto } from './dto/create-event-def.dto';
import { UpdateEventDefDto } from './dto/update-event-def.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventStatus } from '../../database/entities/event-definition.entity';

@ApiTags('Event Registry')
@Controller('v1/registry/events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get()
  @ApiOperation({ summary: 'List registered & discovered events' })
  @ApiQuery({ name: 'status', enum: EventStatus, required: false })
  @ApiQuery({ name: 'category', required: false })
  async list(
    @Query('status') status?: EventStatus,
    @Query('category') category?: string,
  ) {
    return this.registryService.listEvents(status, category);
  }

  @Get(':eventName')
  @ApiOperation({ summary: 'Get details and schema for an event' })
  async getByName(@Param('eventName') eventName: string) {
    return this.registryService.getEventByName(eventName);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new event definition' })
  async create(@Body() dto: CreateEventDefDto) {
    return this.registryService.createEvent(dto);
  }

  @Put(':eventName')
  @ApiOperation({ summary: 'Update an existing event definition' })
  async update(
    @Param('eventName') eventName: string,
    @Body() dto: UpdateEventDefDto,
  ) {
    return this.registryService.updateEvent(eventName, dto);
  }

  @Post(':eventName/deprecate')
  @ApiOperation({ summary: 'Mark an event as DEPRECATED' })
  async deprecate(@Param('eventName') eventName: string) {
    return this.registryService.deprecateEvent(eventName);
  }
}
