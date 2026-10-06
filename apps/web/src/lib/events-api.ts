import { getAuth0 } from './auth0';

export type EventSummary = {
  id: string;
  title: string;
  status: string;
};

export type EventsPage = {
  items: EventSummary[];
  total: number;
};

function isEventSummary(value: unknown): value is EventSummary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.id === 'string' &&
    typeof event.title === 'string' &&
    typeof event.status === 'string'
  );
}

export async function getEvents(): Promise<EventsPage> {
  const base = process.env.API_INTERNAL_URL;

  if (!base) {
    throw new Error('Falta configurar API_INTERNAL_URL.');
  }

  const { token } = await getAuth0().getAccessToken();

  const response = await fetch(new URL('/events?page=1&limit=20', base), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`La API de eventos respondió HTTP ${response.status}.`);
  }

  const data: unknown = await response.json();

  if (typeof data !== 'object' || data === null) {
    throw new Error('Respuesta de eventos inválida.');
  }

  const result = data as Record<string, unknown>;

  if (
    !Array.isArray(result.items) ||
    !result.items.every(isEventSummary) ||
    typeof result.total !== 'number'
  ) {
    throw new Error('Respuesta de eventos inválida.');
  }

  return { items: result.items, total: result.total };
}
