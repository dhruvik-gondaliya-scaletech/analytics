import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  async get() {
    return { status: 'success', module: 'health', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'health', action: 'created', data: payload };
  }
}
