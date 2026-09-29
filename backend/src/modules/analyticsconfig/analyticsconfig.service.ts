import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsconfigService {
  async get() {
    return { status: 'success', module: 'analyticsconfig', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'analyticsconfig', action: 'created', data: payload };
  }
}
