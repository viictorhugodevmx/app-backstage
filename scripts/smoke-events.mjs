import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = 'http://127.0.0.1:3001';
const admin = process.env.BACKSTAGE_SMOKE_ADMIN_TOKEN;
const viewer = process.env.BACKSTAGE_SMOKE_VIEWER_TOKEN;

assert.ok(admin, 'Falta el access token del administrador.');
assert.ok(viewer, 'Falta el access token del lector.');
assert.notEqual(
  admin,
  viewer,
  'Los tokens deben pertenecer a usuarios distintos.',
);

async function request(
  path,
  { method = 'GET', token, body, expected = 200 } = {},
) {
  const headers = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  assert.equal(
    response.status,
    expected,
    `${method} ${path}: se esperaba ${expected}, llegó ${response.status}`,
  );

  console.log(`OK: ${method} ${path} → ${response.status}`);

  return await response.json();
}

await request('/health/ready');
await request('/events', { expected: 401 });
await request('/events', { token: 'invalid-token', expected: 401 });

const readerEvents = await request('/events?page=1&limit=2', { token: viewer });
assert.ok(Array.isArray(readerEvents.items));

const payload = {
  slug: `smoke-auth-${randomUUID()}`,
  title: 'Prueba autenticada HTTP',
  description: 'Evento ficticio de verificación.',
  venue: 'Foro de pruebas',
  city: 'Tuxtla',
  startsAt: '2026-12-12T18:00:00-06:00',
  endsAt: '2026-12-12T22:00:00-06:00',
  capacity: 50,
};

await request('/events', {
  method: 'POST',
  token: viewer,
  body: payload,
  expected: 403,
});

await request('/events', {
  method: 'POST',
  token: admin,
  body: { ...payload, status: 'ready' },
  expected: 400,
});

const created = await request('/events', {
  method: 'POST',
  token: admin,
  body: payload,
  expected: 201,
});

assert.equal(created.status, 'draft');

await request('/events', {
  method: 'POST',
  token: admin,
  body: payload,
  expected: 409,
});

const path = `/events/${created.id}`;
const detail = await request(path, { token: viewer });
assert.equal(detail.id, created.id);

await request(path, {
  method: 'PATCH',
  token: viewer,
  body: { title: 'Edición prohibida' },
  expected: 403,
});

await request(`${path}/cancel`, {
  method: 'POST',
  token: viewer,
  expected: 403,
});

const updated = await request(path, {
  method: 'PATCH',
  token: admin,
  body: { title: 'Prueba autenticada HTTP editada' },
});

assert.equal(updated.title, 'Prueba autenticada HTTP editada');
assert.equal(updated.description, payload.description);

const cancelled = await request(`${path}/cancel`, {
  method: 'POST',
  token: admin,
});

assert.equal(cancelled.status, 'cancelled');

const repeated = await request(`${path}/cancel`, {
  method: 'POST',
  token: admin,
});

assert.deepEqual(repeated, cancelled);

console.log(`Evento de evidencia: ${created.id}`);
console.log('SMOKE AUTH0 Y PERMISOS COMPLETADO');
