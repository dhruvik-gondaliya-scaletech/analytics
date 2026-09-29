import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface RetentionQueryParams {
  cohortEvent: string;
  returnEvent: string;
  startDate: string;
  endDate: string;
}

class RetentionService {
  async getRetention(params: RetentionQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.RETENTION.BASE, {
      params,
    });
    return response.data?.data || response.data || [];
  }
}

export const retentionService = new RetentionService();
