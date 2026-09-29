import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface TrendQueryParams {
  eventName: string;
  startDate: string;
  endDate: string;
  interval?: 'day' | 'hour' | 'minute';
}

class TrendService {
  async getEventTrend(params: TrendQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.TRENDS.BASE, {
      params,
    });
    return response.data?.data || response.data || [];
  }
}

export const trendService = new TrendService();
