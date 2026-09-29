import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface BreakdownQueryParams {
  startDate: string;
  endDate: string;
}

class BreakdownService {
  async getBreakdown(params: BreakdownQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.BREAKDOWN.BASE, {
      params,
    });
    return response.data;
  }
}

export const breakdownService = new BreakdownService();
