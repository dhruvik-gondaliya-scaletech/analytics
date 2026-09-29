import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class IdentityService {
  async getIdentity(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.MANAGEMENT.IDENTITY);
    return response.data?.data || response.data || [];
  }

  async createIdentity(payload: any): Promise<any> {
    const response = await http.post<any>(API_ROUTES.MANAGEMENT.IDENTITY, payload);
    return response.data?.data || response.data || [];
  }
}

export const identityService = new IdentityService();
