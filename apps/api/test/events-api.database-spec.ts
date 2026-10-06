import { AccessTokenGuard } from '../src/auth/access-token.guard.js';
import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import type { QueryResultRow } from 'pg';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { AppModule } from '../src/app.module.js';
import { createValidationPipe } from '../src/common/validation.js';
import { createDatabaseClient } from '../src/database/client.js';
import { DatabaseService } from '../src/database/database.service.js';
import { runMigrations } from '../src/database/migrate.js';
import { seedEvents } from '../src/database/seed.js';

interface ApiEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  startsAt: string;
  endsAt: string;
}

describe('API de eventos con PostgreSQL', () => {
  const client = createDatabaseClient('test');
  let app: NestFastifyApplication;

  function eventPayload(overrides: Record<string, unknown> = {}) {
    return {
      slug: `test-${randomUUID()}`,
      title: 'Evento de integración',
      description: 'Descripción que debe conservarse.',
      venue: 'Foro de prueba',
      city: 'Tuxtla',
      startsAt: '2026-12-01T18:00:00-06:00',
      endsAt: '2026-12-01T22:00:00-06:00',
      capacity: 100,
      ...overrides,
    };
  }

  async function createEvent(overrides: Record<string, unknown> = {}) {
    const response = await app.inject({
      method: 'POST',
      url: '/events',
      payload: eventPayload(overrides),
    });

    expect(response.statusCode).toBe(201);
    return response.json<ApiEvent>();
  }

  beforeAll(async () => {
    await client.connect();

    const identity = await client.query<{ database: string }>(
      'SELECT current_database() AS database',
    );

    expect(identity.rows[0]?.database).toBe('backstage_test');

    await runMigrations(client);

    const testDatabase = {
      query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
        return client.query<T>(text, values);
      },
      async checkConnection() {
        await client.query('SELECT 1');
      },
    };

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(DatabaseService)
      .useValue(testDatabase)
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(createValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    await client.query('BEGIN');
    await seedEvents(client);
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
  });

  afterAll(async () => {
    try {
      await app?.close();
    } finally {
      await client.end();
    }
  });

  it('lista eventos con paginación', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events?page=1&limit=2',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toHaveLength(2);
    expect(body.total).toBeGreaterThanOrEqual(3);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(2);
  });

  it('filtra por estado', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events?status=planning',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ items: ApiEvent[] }>();
    expect(body.items.length).toBeGreaterThanOrEqual(2);
    expect(body.items.every((event) => event.status === 'planning')).toBe(true);
  });

  it('conserva el total cuando la página está vacía', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events?page=10000&limit=100',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toEqual([]);
    expect(body.total).toBeGreaterThanOrEqual(3);
  });

  it('devuelve el detalle de un evento', async () => {
    const event = await createEvent();
    const response = await app.inject({
      method: 'GET',
      url: `/events/${event.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json<ApiEvent>().id).toBe(event.id);
  });

  it('devuelve 404 para un evento inexistente', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/events/${randomUUID()}`,
    });

    expect(response.statusCode).toBe(404);
  });

  it('rechaza un identificador que no es UUID', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events/no-es-uuid',
    });

    expect(response.statusCode).toBe(400);
  });

  it('crea eventos en estado draft', async () => {
    const event = await createEvent();
    expect(event.status).toBe('draft');

    const stored = await client.query<{ status: string }>(
      'SELECT status FROM events WHERE id = $1',
      [event.id],
    );

    expect(stored.rows[0]?.status).toBe('draft');
  });

  it('rechaza el estado enviado en la creación', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/events',
      payload: eventPayload({ status: 'ready' }),
    });

    expect(response.statusCode).toBe(400);
  });

  it('rechaza fechas en orden incorrecto', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/events',
      payload: eventPayload({
        endsAt: '2026-12-01T17:00:00-06:00',
      }),
    });

    expect(response.statusCode).toBe(400);
  });

  it('devuelve 409 para un slug duplicado', async () => {
    const slug = `test-${randomUUID()}`;
    await createEvent({ slug });

    const response = await app.inject({
      method: 'POST',
      url: '/events',
      payload: eventPayload({ slug }),
    });

    expect(response.statusCode).toBe(409);
  });

  it('edita el título y conserva los campos omitidos', async () => {
    const event = await createEvent();
    const response = await app.inject({
      method: 'PATCH',
      url: `/events/${event.id}`,
      payload: { title: 'Título actualizado' },
    });

    expect(response.statusCode).toBe(200);
    const updated = response.json<ApiEvent>();
    expect(updated.title).toBe('Título actualizado');
    expect(updated.description).toBe(event.description);
    expect(updated.startsAt).toBe(event.startsAt);
    expect(updated.status).toBe('draft');
  });

  it('rechaza una edición vacía', async () => {
    const event = await createEvent();
    const response = await app.inject({
      method: 'PATCH',
      url: `/events/${event.id}`,
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('rechaza null en un campo de edición', async () => {
    const event = await createEvent();
    const response = await app.inject({
      method: 'PATCH',
      url: `/events/${event.id}`,
      payload: { title: null },
    });

    expect(response.statusCode).toBe(400);
  });

  it('permite repetir la cancelación sin modificar el resultado', async () => {
    const event = await createEvent();

    const first = await app.inject({
      method: 'POST',
      url: `/events/${event.id}/cancel`,
    });

    const second = await app.inject({
      method: 'POST',
      url: `/events/${event.id}/cancel`,
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.json<ApiEvent>().status).toBe('cancelled');
    expect(second.json()).toEqual(first.json());
  });

  it('no permite cancelar un evento completado', async () => {
    const event = await createEvent();

    await client.query("UPDATE events SET status = 'completed' WHERE id = $1", [
      event.id,
    ]);

    const response = await app.inject({
      method: 'POST',
      url: `/events/${event.id}/cancel`,
    });

    expect(response.statusCode).toBe(409);
  });

  it('rechaza paginación fuera del límite', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events?limit=101',
    });

    expect(response.statusCode).toBe(400);
  });

  it('devuelve 404 al editar un evento inexistente', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/events/${randomUUID()}`,
      payload: { title: 'Título actualizado' },
    });

    expect(response.statusCode).toBe(404);
  });

  it('rechaza capacidad negativa', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/events',
      payload: eventPayload({ capacity: -1 }),
    });

    expect(response.statusCode).toBe(400);
  });
});
