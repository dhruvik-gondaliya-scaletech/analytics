import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface DrilldownQueryParams {
  startDate: string;
  endDate: string;
}

class DrilldownService {
  async getDrilldown(params: DrilldownQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.DRILLDOWN.BASE, {
      params,
    });
    return response.data;
  }
}

export const drilldownService = new DrilldownService();
