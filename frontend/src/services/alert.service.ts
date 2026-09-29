import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class AlertService {
  async getAlert(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.MANAGEMENT.ALERT);
    return response.data;
  }

  async createAlert(payload: any): Promise<any> {
    const response = await http.post<any>(API_ROUTES.MANAGEMENT.ALERT, payload);
    return response.data;
  }
}

export const alertService = new AlertService();
