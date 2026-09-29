import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class AnalyticsconfigService {
  async getAnalyticsconfig(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.MANAGEMENT.ANALYTICSCONFIG);
    return response.data?.data || response.data || [];
  }

  async createAnalyticsconfig(payload: any): Promise<any> {
    const response = await http.post<any>(API_ROUTES.MANAGEMENT.ANALYTICSCONFIG, payload);
    return response.data?.data || response.data || [];
  }
}

export const analyticsconfigService = new AnalyticsconfigService();
