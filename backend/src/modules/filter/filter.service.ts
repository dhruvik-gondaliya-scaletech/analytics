import { Injectable } from '@nestjs/common';

@Injectable()
export class FilterService {
  async get() {
    return { status: 'success', module: 'filter', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'filter', action: 'created', data: payload };
  }
}
