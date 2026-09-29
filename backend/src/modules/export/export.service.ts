import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportService {
  async get() {
    return { status: 'success', module: 'export', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'export', action: 'created', data: payload };
  }
}
