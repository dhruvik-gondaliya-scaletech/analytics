import { Injectable, Logger } from '@nestjs/common';
import { RedpandaService } from '../redpanda/redpanda.service';
import { SingleEventDto } from './dto/ingest-event.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly redpandaService: RedpandaService) {}

  async processSingleEvent(event: SingleEventDto) {
    const processedEvent = this.enrichEvent(event);
    
    // Publish to Redpanda
    await this.redpandaService.sendEvent(
      'analytics.events',
      processedEvent.event_id,
      processedEvent
    );

    return {
      accepted: true,
      event_id: processedEvent.event_id,
      anonymous_id: processedEvent.context?.anonymous_id,
      received_at: processedEvent.received_at,
    };
  }

  async processBatchEvents(events: SingleEventDto[]) {
    const responses: any[] = [];
    for (const event of events) {
      try {
        const response = await this.processSingleEvent(event);
        responses.push(response);
      } catch (error: any) {
        this.logger.error(`Failed to process event in batch`, error);
        responses.push({ accepted: false, error: error.message });
      }
    }
    return responses;
  }

  private enrichEvent(event: SingleEventDto) {
    const received_at = new Date().toISOString();
    return {
      ...event,
      event_id: event.event_id || `evt_${uuidv4().replace(/-/g, '')}`,
      occurred_at: event.occurred_at || received_at,
      received_at,
    };
  }
}
