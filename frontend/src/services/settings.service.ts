import httpService from '../lib/http-services';
import { API_ENDPOINTS } from '../lib/constants';
import type { IngestionApiKey, User } from '../types';

export interface CreateKeyPayload {
  name: string;
}

export interface CreateUserPayload {
  email: string;
  displayName: string;
  password?: string;
  role: 'ADMIN' | 'ANALYST';
}

export class SettingsService {
  public async getIngestionKeys(): Promise<IngestionApiKey[]> {
    const response = await httpService.get<IngestionApiKey[]>(API_ENDPOINTS.INGESTION_KEYS);
    return response.data;
  }

  public async createIngestionKey(payload: CreateKeyPayload): Promise<{ token: string; key: IngestionApiKey }> {
    const response = await httpService.post<{ token: string; key: IngestionApiKey }>(API_ENDPOINTS.INGESTION_KEYS, payload);
    return response.data;
  }

  public async revokeIngestionKey(id: string): Promise<void> {
    await httpService.delete(API_ENDPOINTS.KEY_BY_ID(id));
  }

  public async getUsers(): Promise<User[]> {
    const response = await httpService.get<User[]>(API_ENDPOINTS.USERS);
    return response.data;
  }

  public async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await httpService.post<User>(API_ENDPOINTS.USERS, payload);
    return response.data;
  }

  public async purgeUserData(userId: string): Promise<void> {
    await httpService.post(API_ENDPOINTS.PURGE_USER_DATA, { user_id: userId });
  }
}

export const settingsService = new SettingsService();
