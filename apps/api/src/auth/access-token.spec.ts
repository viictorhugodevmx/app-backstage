import { UnauthorizedException } from '@nestjs/common';
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { verifyAccessToken } from './access-token.js';

const config = {
  issuer: 'https://auth.example.com/',
  audience: 'https://backstage.local/api',
};

let keys: Awaited<ReturnType<typeof generateKeyPair>>;
let otherKeys: Awaited<ReturnType<typeof generateKeyPair>>;
let resolver: JWTVerifyGetKey;

beforeAll(async () => {
  keys = await generateKeyPair('RS256');
  otherKeys = await generateKeyPair('RS256');

  const publicKey = await exportJWK(keys.publicKey);

  resolver = createLocalJWKSet({
    keys: [{ ...publicKey, kid: 'lab-key', alg: 'RS256', use: 'sig' }],
  });
});

async function sign(
  overrides: Partial<JWTPayload> = {},
  key = keys.privateKey,
) {
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({
    sub: 'auth0|lab-user',
    iss: config.issuer,
    aud: config.audience,
    iat: now,
    exp: now + 300,
    permissions: ['read:events'],
    ...overrides,
  })
    .setProtectedHeader({ alg: 'RS256', kid: 'lab-key' })
    .sign(key);
}

describe('Verificación de access tokens', () => {
  it('acepta una firma válida y devuelve identidad y permisos', async () => {
    const result = await verifyAccessToken(await sign(), resolver, config);

    expect(result).toEqual({
      subject: 'auth0|lab-user',
      permissions: ['read:events'],
    });
  });

  it('rechaza tokens vencidos', async () => {
    const token = await sign({ exp: Math.floor(Date.now() / 1000) - 60 });

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza un emisor diferente', async () => {
    const token = await sign({ iss: 'https://other.example.com/' });

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza una audiencia diferente', async () => {
    const token = await sign({ aud: 'https://other.example.com/api' });

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza firmas realizadas con otra clave', async () => {
    const token = await sign({}, otherKeys.privateKey);

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza HS256 aunque el token esté firmado', async () => {
    const now = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({
      sub: 'lab-user',
      iss: config.issuer,
      aud: config.audience,
      iat: now,
      exp: now + 300,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(new Uint8Array(32).fill(7));

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza tokens sin expiración', async () => {
    const token = await sign({ exp: undefined });

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza tokens sin sujeto', async () => {
    const token = await sign({ sub: undefined });

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza permisos con formato incorrecto', async () => {
    const token = await sign({ permissions: 'read:events' });

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('no inventa permisos cuando el token no los contiene', async () => {
    const token = await sign({ permissions: undefined });

    expect(await verifyAccessToken(token, resolver, config)).toEqual({
      subject: 'auth0|lab-user',
      permissions: [],
    });
  });

  it('rechaza tokens que todavía no son válidos', async () => {
    const token = await sign({ nbf: Math.floor(Date.now() / 1000) + 60 });

    await expect(
      verifyAccessToken(token, resolver, config),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
