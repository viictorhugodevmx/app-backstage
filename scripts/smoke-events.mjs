import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const baseUrl = 'http://127.0.0.1:3001';

async function request(path, options = {}) {
  const { method = 'GET', body, expected = 200 } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers:
      body === undefined
        ? undefined
        : {
            'content-type': 'application/json',
          },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  const result = await response.json();

  assert.equal(
    response.status,
    expected,
    `${method} ${path}: ${JSON.stringify(result)}`,
  );

  console.log(`OK: ${method} ${path} → ${response.status}`);
  return result;
}

const health = await request('/health/ready');
assert.equal(health.database, 'postgresql');

const list = await request('/events?page=1&limit=2');
assert.ok(Array.isArray(list.items));
assert.equal(list.page, 1);
assert.equal(list.limit, 2);

const filtered = await request('/events?status=planning');
assert.ok(filtered.items.every((event) => event.status === 'planning'));

await request('/events?limit=101', { expected: 400 });
await request('/events/no-es-uuid', { expected: 400 });
await request(`/events/${randomUUID()}`, { expected: 404 });

const payload = {
  slug: `smoke-http-${randomUUID()}`,
  title: 'Prueba operativa HTTP',
  description: 'Evento ficticio creado para comprobar la API.',
  venue: 'Foro de pruebas',
  city: 'Tuxtla',
  startsAt: '2026-12-12T18:00:00-06:00',
  endsAt: '2026-12-12T22:00:00-06:00',
  capacity: 50,
};

await request('/events', {
  method: 'POST',
  body: { ...payload, status: 'ready' },
  expected: 400,
});

const created = await request('/events', {
  method: 'POST',
  body: payload,
  expected: 201,
});

assert.equal(created.status, 'draft');

await request('/events', {
  method: 'POST',
  body: payload,
  expected: 409,
});

const detail = await request(`/events/${created.id}`);
assert.equal(detail.id, created.id);

const updated = await request(`/events/${created.id}`, {
  method: 'PATCH',
  body: { title: 'Prueba operativa HTTP editada' },
});

assert.equal(updated.title, 'Prueba operativa HTTP editada');
assert.equal(updated.description, payload.description);

await request(`/events/${created.id}`, {
  method: 'PATCH',
  body: { title: null },
  expected: 400,
});

const cancelled = await request(`/events/${created.id}/cancel`, {
  method: 'POST',
});

assert.equal(cancelled.status, 'cancelled');

const repeated = await request(`/events/${created.id}/cancel`, {
  method: 'POST',
});

assert.deepEqual(repeated, cancelled);

console.log(`Evento de evidencia: ${created.id}`);
console.log('SMOKE HTTP DE EVENTOS COMPLETADO');
