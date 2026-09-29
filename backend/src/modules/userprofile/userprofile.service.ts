import { Injectable } from '@nestjs/common';

@Injectable()
export class UserprofileService {
  async get() {
    return { status: 'success', module: 'userprofile', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'userprofile', action: 'created', data: payload };
  }
}
