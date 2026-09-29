import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class FilterService {
  async getFilter(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.MANAGEMENT.FILTER);
    return response.data;
  }

  async createFilter(payload: any): Promise<any> {
    const response = await http.post<any>(API_ROUTES.MANAGEMENT.FILTER, payload);
    return response.data;
  }
}

export const filterService = new FilterService();
