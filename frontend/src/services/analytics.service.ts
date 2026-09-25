import httpService from '../lib/http-services';
import { API_ENDPOINTS, API_BASE_URL } from '../lib/constants';
import type { OverviewData, EventItem, FunnelData, RetentionData } from '../types';

export interface GetEventsParams {
  page?: number;
  limit?: number;
  event_name?: string;
  user_id?: string;
  search?: string;
}

export interface FunnelPayload {
  steps: string[];
  window_days: number;
  date_range: {
    from: string;
    to: string;
  };
}

export interface RetentionPayload {
  cohort_event: string;
  return_event?: string;
  date_range: {
    from: string;
    to: string;
  };
}

export interface EventsResponse {
  items: EventItem[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export class AnalyticsService {
  public async getOverview(): Promise<OverviewData> {
    const response = await httpService.get<OverviewData>(API_ENDPOINTS.OVERVIEW);
    return response.data;
  }

  public async getEvents(params?: GetEventsParams): Promise<EventsResponse> {
    const response = await httpService.get<EventsResponse>(API_ENDPOINTS.EVENTS, { params });
    return response.data;
  }

  public getExportCsvUrl(params?: GetEventsParams): string {
    const searchParams = new URLSearchParams();
    if (params?.event_name) searchParams.append('event_name', params.event_name);
    if (params?.user_id) searchParams.append('user_id', params.user_id);
    if (params?.search) searchParams.append('search', params.search);
    return `${API_BASE_URL}${API_ENDPOINTS.EXPORT_CSV}?${searchParams.toString()}`;
  }

  public async calculateFunnel(payload: FunnelPayload): Promise<FunnelData> {
    const response = await httpService.post<FunnelData>(API_ENDPOINTS.FUNNEL, payload);
    return response.data;
  }

  public async calculateRetention(payload: RetentionPayload): Promise<RetentionData> {
    const response = await httpService.post<RetentionData>(API_ENDPOINTS.RETENTION, payload);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
