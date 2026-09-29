import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface FunnelQueryParams {
  steps: string[] | string;
  startDate: string;
  endDate: string;
  window?: number;
}

class FunnelService {
  async getFunnel(params: FunnelQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.FUNNEL.BASE, {
      params,
    });
    return response.data;
  }
}

export const funnelService = new FunnelService();
