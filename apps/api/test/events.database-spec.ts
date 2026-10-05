import { randomUUID } from 'node:crypto';
import pg from 'pg';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  createDatabaseClient,
  getDatabaseConfig,
} from '../src/database/client.js';
import { runMigrations } from '../src/database/migrate.js';
import { demoEvents, seedEvents } from '../src/database/seed.js';

const client = createDatabaseClient('test');

beforeAll(async () => {
  await client.connect();

  const identity = await client.query<{
    database: string;
    user: string;
  }>('SELECT current_database() AS database, current_user AS "user"');

  expect(identity.rows[0]).toEqual({
    database: 'backstage_test',
    user: 'backstage_test',
  });

  await runMigrations(client);
});

afterAll(async () => {
  await client.end();
});

describe('Historial de migraciones', () => {
  it('no vuelve a aplicar una migración registrada', async () => {
    const before = await client.query(
      'SELECT name, checksum, applied_at FROM schema_migrations ORDER BY name',
    );

    await runMigrations(client);

    const after = await client.query(
      'SELECT name, checksum, applied_at FROM schema_migrations ORDER BY name',
    );

    expect(after.rows).toEqual(before.rows);
    expect(after.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '001_create_events.sql' }),
      ]),
    );
  });
});

describe('Eventos', () => {
  beforeEach(async () => {
    await client.query('BEGIN');
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
  });

  function insertEvent(
    overrides: {
      slug?: string;
      capacity?: number;
      status?: string;
      endsAt?: string;
    } = {},
  ) {
    return client.query<{ id: string; slug: string }>(
      `INSERT INTO events
        (slug, title, venue, city, starts_at, ends_at, capacity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, slug`,
      [
        overrides.slug ?? `test-${randomUUID()}`,
        'Evento de prueba',
        'Foro de prueba',
        'Tuxtla',
        '2026-11-01T18:00:00Z',
        overrides.endsAt ?? '2026-11-01T22:00:00Z',
        overrides.capacity ?? 100,
        overrides.status ?? 'draft',
      ],
    );
  }

  it('guarda un evento válido y genera su identificador', async () => {
    const result = await insertEvent();

    expect(result.rows[0]?.id).toMatch(
      /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/,
    );
  });

  it('rechaza capacidad cero', async () => {
    await expect(insertEvent({ capacity: 0 })).rejects.toMatchObject({
      code: '23514',
      constraint: 'events_positive_capacity',
    });
  });

  it('rechaza una fecha final anterior al inicio', async () => {
    await expect(
      insertEvent({ endsAt: '2026-11-01T17:00:00Z' }),
    ).rejects.toMatchObject({
      code: '23514',
      constraint: 'events_date_order',
    });
  });

  it('rechaza un estado desconocido', async () => {
    await expect(insertEvent({ status: 'unknown' })).rejects.toMatchObject({
      code: '23514',
      constraint: 'events_valid_status',
    });
  });

  it('rechaza slugs duplicados', async () => {
    const slug = `test-${randomUUID()}`;

    await insertEvent({ slug });

    await expect(insertEvent({ slug })).rejects.toMatchObject({
      code: '23505',
    });
  });

  it('el seed puede repetirse sin duplicar eventos', async () => {
    await seedEvents(client);

    const secondInsertions = await seedEvents(client);
    const result = await client.query<{ count: number }>(
      `SELECT count(*)::integer AS count
       FROM events WHERE slug = ANY($1::text[])`,
      [demoEvents.map((event) => event.slug)],
    );

    expect(secondInsertions).toBe(0);
    expect(result.rows[0]?.count).toBe(3);
  });
});

describe('Aislamiento entre bases', () => {
  it.each([
    ['dev', 'backstage_test'],
    ['test', 'backstage'],
  ] as const)(
    'el usuario %s no puede conectarse a %s',
    async (target, forbiddenDatabase) => {
      const forbiddenClient = new pg.Client({
        ...getDatabaseConfig(target),
        database: forbiddenDatabase,
      });

      try {
        await expect(forbiddenClient.connect()).rejects.toMatchObject({
          code: '42501',
        });
      } finally {
        await forbiddenClient.end();
      }
    },
  );
});
