import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditService {
  async get() {
    return { status: 'success', module: 'audit', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'audit', action: 'created', data: payload };
  }
}
