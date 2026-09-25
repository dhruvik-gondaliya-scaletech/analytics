import httpService from '../lib/http-services';
import { API_ENDPOINTS } from '../lib/constants';
import type { Dashboard } from '../types';

export interface CreateDashboardPayload {
  title: string;
  description?: string;
  visibility?: 'PRIVATE' | 'SHARED';
}

export class DashboardsService {
  public async getDashboards(): Promise<Dashboard[]> {
    const response = await httpService.get<Dashboard[]>(API_ENDPOINTS.DASHBOARDS);
    return response.data;
  }

  public async createDashboard(payload: CreateDashboardPayload): Promise<Dashboard> {
    const response = await httpService.post<Dashboard>(API_ENDPOINTS.DASHBOARDS, payload);
    return response.data;
  }

  public async deleteDashboard(id: string): Promise<void> {
    await httpService.delete(API_ENDPOINTS.DASHBOARD_BY_ID(id));
  }
}

export const dashboardsService = new DashboardsService();
