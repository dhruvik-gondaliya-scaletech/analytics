import { Injectable } from '@nestjs/common';

@Injectable()
export class AcquisitionService {
  async get() {
    return { status: 'success', module: 'acquisition', data: [] };
  }

  async create(payload: any) {
    return { status: 'success', module: 'acquisition', action: 'created', data: payload };
  }
}
