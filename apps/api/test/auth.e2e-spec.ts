import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { AccessTokenService } from '../src/auth/access-token.service.js';
import { verifyAccessToken } from '../src/auth/access-token.js';
import { createValidationPipe } from '../src/common/validation.js';
import { EventsRepository } from '../src/events/events.repository.js';

const config = {
  issuer: 'https://auth.example.com/',
  audience: 'https://backstage.local/api',
};

const event = {
  id: '3a395606-7b74-4312-8b5e-4823f9976825',
  slug: 'evento-seguridad',
  title: 'Evento de seguridad',
  description: 'Evento ficticio.',
  venue: 'Foro de pruebas',
  city: 'Tuxtla',
  startsAt: new Date('2026-12-12T18:00:00Z'),
  endsAt: new Date('2026-12-12T22:00:00Z'),
  capacity: 100,
  status: 'draft',
  createdAt: new Date('2026-10-05T12:00:00Z'),
  updatedAt: new Date('2026-10-05T12:00:00Z'),
};

const body = {
  slug: event.slug,
  title: event.title,
  description: event.description,
  venue: event.venue,
  city: event.city,
  startsAt: event.startsAt.toISOString(),
  endsAt: event.endsAt.toISOString(),
  capacity: event.capacity,
};

let app: NestFastifyApplication;
let keys: Awaited<ReturnType<typeof generateKeyPair>>;
let resolver: JWTVerifyGetKey;

async function token(
  permissions: string[],
  overrides: Partial<JWTPayload> = {},
) {
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({
    sub: 'auth0|security-test',
    iss: config.issuer,
    aud: config.audience,
    iat: now,
    exp: now + 300,
    permissions,
    ...overrides,
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'security-key' })
    .sign(keys.privateKey);
}

beforeAll(async () => {
  keys = await generateKeyPair('RS256');
  const publicKey = await exportJWK(keys.publicKey);

  resolver = createLocalJWKSet({
    keys: [{ ...publicKey, kid: 'security-key', alg: 'RS256', use: 'sig' }],
  });

  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AccessTokenService)
    .useValue({
      verify: (value: string) => verifyAccessToken(value, resolver, config),
    })
    .overrideProvider(EventsRepository)
    .useValue({
      list: vi.fn().mockResolvedValue({
        items: [event],
        total: 1,
        page: 1,
        limit: 20,
      }),
      findById: vi.fn().mockResolvedValue(event),
      create: vi.fn().mockResolvedValue(event),
      update: vi.fn().mockResolvedValue(event),
      cancel: vi.fn().mockResolvedValue({ ...event, status: 'cancelled' }),
    })
    .compile();

  app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  app.useGlobalPipes(createValidationPipe());

  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

describe('Autenticación y permisos HTTP', () => {
  it('mantiene el health público', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
  });

  it('rechaza peticiones sin token con 401', async () => {
    const response = await app.inject({ method: 'GET', url: '/events' });
    expect(response.statusCode).toBe(401);
  });

  it('rechaza tokens inválidos con 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events',
      headers: { authorization: 'Bearer invalid-token' },
    });

    expect(response.statusCode).toBe(401);
  });

  it('rechaza tokens vencidos con 401', async () => {
    const value = await token(['read:events'], {
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/events',
      headers: { authorization: `Bearer ${value}` },
    });

    expect(response.statusCode).toBe(401);
  });

  it('rechaza otra audiencia con 401', async () => {
    const value = await token(['read:events'], { aud: 'other-api' });

    const response = await app.inject({
      method: 'GET',
      url: '/events',
      headers: { authorization: `Bearer ${value}` },
    });

    expect(response.statusCode).toBe(401);
  });

  it('permite al lector consultar eventos', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events',
      headers: { authorization: `Bearer ${await token(['read:events'])}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().items[0].id).toBe(event.id);
  });

  it('rechaza un token válido sin permiso de lectura con 403', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/events',
      headers: { authorization: `Bearer ${await token([])}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it.each([
    { method: 'POST' as const, url: '/events', payload: body },
    {
      method: 'PATCH' as const,
      url: `/events/${event.id}`,
      payload: { title: 'Título editado' },
    },
    {
      method: 'POST' as const,
      url: `/events/${event.id}/cancel`,
      payload: undefined,
    },
  ])(
    'impide al lector $method $url con 403',
    async ({ method, url, payload }) => {
      const response = await app.inject({
        method,
        url,
        payload,
        headers: { authorization: `Bearer ${await token(['read:events'])}` },
      });

      expect(response.statusCode).toBe(403);
    },
  );

  it('permite crear con create:events', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/events',
      payload: body,
      headers: { authorization: `Bearer ${await token(['create:events'])}` },
    });

    expect(response.statusCode).toBe(201);
  });

  it('permite editar con update:events', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/events/${event.id}`,
      payload: { title: 'Título editado' },
      headers: { authorization: `Bearer ${await token(['update:events'])}` },
    });

    expect(response.statusCode).toBe(200);
  });

  it('impide cancelar al productor sin cancel:events', async () => {
    const value = await token([
      'read:events',
      'create:events',
      'update:events',
    ]);

    const response = await app.inject({
      method: 'POST',
      url: `/events/${event.id}/cancel`,
      headers: { authorization: `Bearer ${value}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it('permite cancelar con cancel:events', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/events/${event.id}/cancel`,
      headers: { authorization: `Bearer ${await token(['cancel:events'])}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe('cancelled');
  });
});
