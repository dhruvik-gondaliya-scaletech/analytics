import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface DropoffQueryParams {
  startDate: string;
  endDate: string;
}

class DropoffService {
  async getDropoff(params: DropoffQueryParams): Promise<any> {
    const response = await http.get<any>(API_ROUTES.DROPOFF.BASE, {
      params,
    });
    return response.data?.data || response.data || [];
  }
}

export const dropoffService = new DropoffService();
