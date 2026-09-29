import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class HealthService {
  async getHealth(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.SYSTEM.HEALTH);
    return response.data?.data || response.data || [];
  }
}

export const healthService = new HealthService();
