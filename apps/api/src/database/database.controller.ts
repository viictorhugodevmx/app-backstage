import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service.js';

@Controller('health')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('ready')
  async getReadiness() {
    await this.databaseService.checkConnection();

    return {
      status: 'ok',
      service: 'backstage-api',
      database: 'postgresql',
    };
  }
}
