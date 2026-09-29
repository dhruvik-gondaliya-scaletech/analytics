import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface ComparisonQueryParams {
  eventName: string;
  baseStartDate: string;
  baseEndDate: string;
  compareStartDate: string;
  compareEndDate: string;
}

class ComparisonService {
  async getComparison(params: ComparisonQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.COMPARISON.BASE, {
      params,
    });
    return response.data;
  }
}

export const comparisonService = new ComparisonService();
