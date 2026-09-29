import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class AcquisitionService {
  async getAcquisition(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.MANAGEMENT.ACQUISITION);
    return response.data?.data || response.data || [];
  }

  async createAcquisition(payload: any): Promise<any> {
    const response = await http.post<any>(API_ROUTES.MANAGEMENT.ACQUISITION, payload);
    return response.data?.data || response.data || [];
  }
}

export const acquisitionService = new AcquisitionService();
