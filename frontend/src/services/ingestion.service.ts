import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface SingleEventDto {
  name: string;
  timestamp?: string;
  properties?: Record<string, any>;
  userId?: string;
  anonymousId?: string;
}

export interface BatchEventDto {
  events: SingleEventDto[];
}

class IngestionService {
  async ingestSingleEvent(payload: SingleEventDto): Promise<any> {
    const response = await http.post<any>(API_ROUTES.INGESTION.EVENTS, payload);
    return response.data?.data || response.data || [];
  }

  async ingestBatchEvents(payload: BatchEventDto): Promise<any> {
    const response = await http.post<any>(API_ROUTES.INGESTION.EVENTS, payload);
    return response.data?.data || response.data || [];
  }
}

export const ingestionService = new IngestionService();
