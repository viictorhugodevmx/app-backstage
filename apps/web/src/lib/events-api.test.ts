import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getAccessToken } = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
}));

vi.mock('./auth0', () => ({
  getAuth0: () => ({ getAccessToken }),
}));

import { getEvents } from './events-api';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv('API_INTERNAL_URL', 'http://api:3001');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  getAccessToken.mockReset();
  getAccessToken.mockResolvedValue({ token: 'test-access-token' });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Consulta autenticada de eventos', () => {
  it('envía el token a la API y evita cachear datos de sesión', async () => {
    const result = {
      items: [{ id: 'event-1', title: 'Sesiones del Sur', status: 'planning' }],
      total: 1,
    };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => result,
    });

    expect(await getEvents()).toEqual(result);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toBe('http://api:3001/events?page=1&limit=20');
    expect(options).toMatchObject({
      headers: { Authorization: 'Bearer test-access-token' },
      cache: 'no-store',
    });
  });

  it('rechaza respuestas HTTP 403', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(getEvents()).rejects.toThrow('HTTP 403');
  });

  it('rechaza respuestas con estructura inválida', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [{ title: 'Incompleto' }], total: 1 }),
    });

    await expect(getEvents()).rejects.toThrow('Respuesta de eventos inválida');
  });

  it('no llama a la API si no puede obtener el token', async () => {
    getAccessToken.mockRejectedValue(new Error('Sin sesión'));

    await expect(getEvents()).rejects.toThrow('Sin sesión');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rechaza una configuración sin dirección de API', async () => {
    vi.stubEnv('API_INTERNAL_URL', '');

    await expect(getEvents()).rejects.toThrow('API_INTERNAL_URL');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
