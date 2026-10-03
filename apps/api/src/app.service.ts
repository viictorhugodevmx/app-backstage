import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok';
  service: 'backstage-api';
}

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'backstage-api',
    };
  }
}
