import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventDefinition, EventStatus } from '../../database/entities/event-definition.entity';
import { EventPropertyDefinition } from '../../database/entities/event-property-definition.entity';
import { CreateEventDefDto } from './dto/create-event-def.dto';
import { UpdateEventDefDto } from './dto/update-event-def.dto';
import { ClickhouseService } from '../../database/clickhouse/clickhouse.service';

@Injectable()
export class RegistryService {
  constructor(
    @InjectRepository(EventDefinition)
    private readonly eventDefRepository: Repository<EventDefinition>,
    @InjectRepository(EventPropertyDefinition)
    private readonly eventPropRepository: Repository<EventPropertyDefinition>,
    private readonly clickhouseService: ClickhouseService,
  ) {}

  async listEvents(status?: EventStatus, category?: string) {
    const query = this.eventDefRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.properties', 'properties')
      .orderBy('event.eventName', 'ASC');

    if (status) {
      query.andWhere('event.status = :status', { status });
    }
    if (category) {
      query.andWhere('event.category = :category', { category });
    }

    const events = await query.getMany();

    // Fetch live ClickHouse stats for events
    try {
      const stats = await this.clickhouseService.query<{
        event_name: string;
        volume: string;
        unique_users: string;
      }>(
        `SELECT event_name, count() as volume, uniqExact(user_id) as unique_users
         FROM analytics.analytics_events
         GROUP BY event_name`,
      );

      const statsMap = new Map(
        stats.map((s) => [s.event_name, { volume: parseInt(s.volume, 10), uniqueUsers: parseInt(s.unique_users, 10) }]),
      );

      return events.map((evt) => {
        const liveStat = statsMap.get(evt.eventName) || { volume: 0, uniqueUsers: 0 };
        return {
          ...evt,
          volume: liveStat.volume,
          uniqueUsers: liveStat.uniqueUsers,
        };
      });
    } catch {
      return events.map((evt) => ({ ...evt, volume: 0, uniqueUsers: 0 }));
    }
  }

  async getEventByName(eventName: string) {
    const event = await this.eventDefRepository.findOne({
      where: { eventName },
      relations: ['properties'],
    });

    if (!event) {
      throw new NotFoundException(`Event definition '${eventName}' not found`);
    }

    let stats: { volume: number; uniqueUsers: number; samplePayload: any } = {
      volume: 0,
      uniqueUsers: 0,
      samplePayload: null,
    };

    try {
      const chStats = await this.clickhouseService.query<{
        volume: string;
        unique_users: string;
      }>(
        `SELECT count() as volume, uniqExact(user_id) as unique_users
         FROM analytics.analytics_events
         WHERE event_name = {eventName: String}`,
        { eventName },
      );

      if (chStats.length > 0) {
        stats.volume = parseInt(chStats[0].volume, 10);
        stats.uniqueUsers = parseInt(chStats[0].unique_users, 10);
      }

      const sample = await this.clickhouseService.query<{
        event_data: string;
        context: string;
      }>(
        `SELECT event_data, context
         FROM analytics.analytics_events
         WHERE event_name = {eventName: String}
         ORDER BY timestamp DESC
         LIMIT 1`,
        { eventName },
      );

      if (sample.length > 0) {
        stats.samplePayload = {
          event_data: JSON.parse(sample[0].event_data || '{}'),
          context: JSON.parse(sample[0].context || '{}'),
        };
      }
    } catch {}

    return {
      ...event,
      ...stats,
    };
  }

  async createEvent(dto: CreateEventDefDto) {
    const existing = await this.eventDefRepository.findOne({
      where: { eventName: dto.event_name },
    });

    if (existing && existing.status !== EventStatus.UNREGISTERED) {
      throw new ConflictException(`Event '${dto.event_name}' is already registered`);
    }

    const event = existing || this.eventDefRepository.create();
    event.eventName = dto.event_name;
    event.displayName = dto.display_name || dto.event_name;
    event.description = dto.description || '';
    event.category = dto.category || 'general';
    event.status = dto.status || EventStatus.ACTIVE;
    if (!event.firstSeenAt) event.firstSeenAt = new Date();
    event.lastSeenAt = new Date();

    const savedEvent = await this.eventDefRepository.save(event);

    if (dto.properties && dto.properties.length > 0) {
      await this.eventPropRepository.delete({ eventDefinitionId: savedEvent.id });
      const props = dto.properties.map((p) =>
        this.eventPropRepository.create({
          eventDefinitionId: savedEvent.id,
          propertyName: p.property_name,
          displayName: p.display_name || p.property_name,
          dataType: p.data_type || 'string',
          required: p.required || false,
          description: p.description || '',
        }),
      );
      await this.eventPropRepository.save(props);
    }

    return this.getEventByName(savedEvent.eventName);
  }

  async updateEvent(eventName: string, dto: UpdateEventDefDto) {
    const event = await this.eventDefRepository.findOne({
      where: { eventName },
    });

    if (!event) {
      throw new NotFoundException(`Event '${eventName}' not found`);
    }

    if (dto.display_name !== undefined) event.displayName = dto.display_name;
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.category !== undefined) event.category = dto.category;
    if (dto.status !== undefined) event.status = dto.status;

    await this.eventDefRepository.save(event);

    if (dto.properties) {
      await this.eventPropRepository.delete({ eventDefinitionId: event.id });
      const props = dto.properties.map((p) =>
        this.eventPropRepository.create({
          eventDefinitionId: event.id,
          propertyName: p.property_name,
          displayName: p.display_name || p.property_name,
          dataType: p.data_type || 'string',
          required: p.required || false,
          description: p.description || '',
        }),
      );
      await this.eventPropRepository.save(props);
    }

    return this.getEventByName(eventName);
  }

  async deprecateEvent(eventName: string) {
    const event = await this.eventDefRepository.findOne({
      where: { eventName },
    });

    if (!event) {
      throw new NotFoundException(`Event '${eventName}' not found`);
    }

    event.status = EventStatus.DEPRECATED;
    await this.eventDefRepository.save(event);

    return { message: `Event '${eventName}' is now marked as DEPRECATED` };
  }
}
