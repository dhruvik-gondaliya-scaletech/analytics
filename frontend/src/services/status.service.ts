import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class StatusService {
  async getStatus(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.SYSTEM.STATUS);
    return response.data;
  }
}

export const statusService = new StatusService();
