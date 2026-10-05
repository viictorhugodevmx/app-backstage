import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AppModule } from '../src/app.module.js';
import { DatabaseService } from '../src/database/database.service.js';

describe('Disponibilidad HTTP', () => {
  let app: NestFastifyApplication;
  const checkConnection = vi.fn<() => Promise<void>>();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({ checkConnection })
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(() => {
    checkConnection.mockReset();
    checkConnection.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('responde 200 cuando PostgreSQL está disponible', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health/ready',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      service: 'backstage-api',
      database: 'postgresql',
    });
    expect(checkConnection).toHaveBeenCalledOnce();
  });

  it('responde 503 cuando PostgreSQL no está disponible', async () => {
    checkConnection.mockRejectedValueOnce(
      new ServiceUnavailableException({
        status: 'error',
        service: 'backstage-api',
        database: 'unavailable',
      }),
    );

    const response = await app.inject({
      method: 'GET',
      url: '/health/ready',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: 'error',
      service: 'backstage-api',
      database: 'unavailable',
    });
  });

  it('la ruta de salud básica no consulta PostgreSQL', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(checkConnection).not.toHaveBeenCalled();
  });
});
