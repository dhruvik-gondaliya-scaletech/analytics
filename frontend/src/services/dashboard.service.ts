import http from "../lib/http-services";
import { API_ROUTES } from "../lib/constants";

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  panels: any[];
  created_at: string;
  updated_at: string;
}

export interface CreateDashboardPayload {
  name: string;
  description?: string;
  is_public?: boolean;
}

class DashboardService {
  async getDashboards(): Promise<Dashboard[]> {
    const response = await http.get<Dashboard[]>(API_ROUTES.DASHBOARDS.BASE);
    return response.data;
  }

  async getDashboard(id: string): Promise<Dashboard> {
    const response = await http.get<Dashboard>(API_ROUTES.DASHBOARDS.BY_ID(id));
    return response.data;
  }

  async createDashboard(payload: CreateDashboardPayload): Promise<Dashboard> {
    const response = await http.post<Dashboard>(API_ROUTES.DASHBOARDS.BASE, payload);
    return response.data;
  }
}

export const dashboardService = new DashboardService();
