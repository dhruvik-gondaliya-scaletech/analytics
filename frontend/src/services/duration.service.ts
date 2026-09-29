import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface DurationQueryParams {
  startDate: string;
  endDate: string;
}

class DurationService {
  async getDuration(params: DurationQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.DURATION.BASE, {
      params,
    });
    return response.data;
  }
}

export const durationService = new DurationService();
