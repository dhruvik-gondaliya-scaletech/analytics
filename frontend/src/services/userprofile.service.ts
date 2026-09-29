import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class UserprofileService {
  async getUserprofile(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.MANAGEMENT.USERPROFILE);
    return response.data;
  }

  async createUserprofile(payload: any): Promise<any> {
    const response = await http.post<any>(API_ROUTES.MANAGEMENT.USERPROFILE, payload);
    return response.data;
  }
}

export const userprofileService = new UserprofileService();
