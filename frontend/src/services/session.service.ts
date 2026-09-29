import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface SessionQueryParams {
  startDate: string;
  endDate: string;
}

class SessionService {
  async getSession(params: SessionQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.SESSION.BASE, {
      params,
    });
    return response.data?.data || response.data || [];
  }
}

export const sessionService = new SessionService();
