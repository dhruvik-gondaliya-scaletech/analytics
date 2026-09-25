import httpService from '../lib/http-services';
import { API_ENDPOINTS } from '../lib/constants';
import type { EventDefinition } from '../types';

export class RegistryService {
  public async getEvents(): Promise<EventDefinition[]> {
    const response = await httpService.get<EventDefinition[]>(API_ENDPOINTS.REGISTRY_EVENTS);
    return response.data;
  }

  public async deprecateEvent(eventName: string): Promise<void> {
    await httpService.post(API_ENDPOINTS.DEPRECATE_EVENT(eventName));
  }
}

export const registryService = new RegistryService();
