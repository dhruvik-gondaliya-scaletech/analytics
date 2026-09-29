import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface EventQueryParams {
  startDate: string;
  endDate: string;
}

class EventService {
  async getEvent(params: EventQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.EVENT.BASE, {
      params,
    });
    return response.data?.data || response.data || [];
  }
}

export const eventService = new EventService();
