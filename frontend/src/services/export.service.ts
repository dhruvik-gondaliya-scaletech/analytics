import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class ExportService {
  async getExport(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.MANAGEMENT.EXPORT);
    return response.data;
  }

  async createExport(payload: any): Promise<any> {
    const response = await http.post<any>(API_ROUTES.MANAGEMENT.EXPORT, payload);
    return response.data;
  }
}

export const exportService = new ExportService();
