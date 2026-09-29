import { Injectable } from '@nestjs/common';

@Injectable()
export class StatusService {
  async get() {
    return { status: 'success', module: 'status', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'status', action: 'created', data: payload };
  }
}
