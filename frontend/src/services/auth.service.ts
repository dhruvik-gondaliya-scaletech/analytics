import httpService from '../lib/http-services';
import { API_CONFIG } from '../lib/constants';
import type { User } from '../types';

export class AuthService {
  public async login(email: string, password: string): Promise<{ user: User; token?: string }> {
    const response = await httpService.post<{ user: User; token?: string }>(API_CONFIG.AUTH.LOGIN, { email, password });
    return response.data;
  }

  public async logout(): Promise<void> {
    await httpService.post(API_CONFIG.AUTH.LOGOUT);
  }

  public async getCurrentUser(): Promise<User> {
    const response = await httpService.get<User>(API_CONFIG.AUTH.ME);
    return response.data;
  }
}

export const authService = new AuthService();
