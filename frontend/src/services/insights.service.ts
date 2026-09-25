import httpService from '../lib/http-services';
import { API_ENDPOINTS } from '../lib/constants';
import type { SavedInsight } from '../types';

export interface CreateInsightPayload {
  title: string;
  description?: string;
  type?: string;
  chart_config: any;
  visibility?: 'PRIVATE' | 'SHARED';
}

export class InsightsService {
  public async getInsights(): Promise<SavedInsight[]> {
    const response = await httpService.get<SavedInsight[]>(API_ENDPOINTS.INSIGHTS);
    return response.data;
  }

  public async createInsight(payload: CreateInsightPayload): Promise<SavedInsight> {
    const response = await httpService.post<SavedInsight>(API_ENDPOINTS.INSIGHTS, payload);
    return response.data;
  }

  public async deleteInsight(id: string): Promise<void> {
    await httpService.delete(API_ENDPOINTS.INSIGHT_BY_ID(id));
  }
}

export const insightsService = new InsightsService();
