import { Injectable } from '@nestjs/common';

@Injectable()
export class IdentityService {
  async get() {
    return { status: 'success', module: 'identity', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'identity', action: 'created', data: payload };
  }
}
