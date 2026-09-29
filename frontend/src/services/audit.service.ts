import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

class AuditService {
  async getAudit(): Promise<any> {
    const response = await http.get<any>(API_ROUTES.MANAGEMENT.AUDIT);
    return response.data;
  }

  async createAudit(payload: any): Promise<any> {
    const response = await http.post<any>(API_ROUTES.MANAGEMENT.AUDIT, payload);
    return response.data;
  }
}

export const auditService = new AuditService();
