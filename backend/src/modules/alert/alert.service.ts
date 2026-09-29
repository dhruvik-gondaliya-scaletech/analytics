import { Injectable } from '@nestjs/common';

@Injectable()
export class AlertService {
  async get() {
    return { status: 'success', module: 'alert', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'alert', action: 'created', data: payload };
  }
}
