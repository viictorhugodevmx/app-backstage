import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import pg from 'pg';
import type { Pool } from 'pg';
import { getDatabaseConfig } from './client.js';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool?: Pool;

  private getPool(): Pool {
    if (!this.pool) {
      this.pool = new pg.Pool({
        ...getDatabaseConfig('dev'),
        max: 5,
        idleTimeoutMillis: 10000,
        query_timeout: 5000,
        statement_timeout: 5000,
      });

      this.pool.on('error', () => {
        this.logger.error('Se perdió una conexión inactiva de PostgreSQL.');
      });
    }

    return this.pool;
  }

  async checkConnection(): Promise<void> {
    try {
      await this.getPool().query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'backstage-api',
        database: 'unavailable',
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
