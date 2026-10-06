import { redirect } from 'next/navigation';
import { getAuth0 } from '@/lib/auth0';
import { getEvents, type EventsPage } from '@/lib/events-api';

export const dynamic = 'force-dynamic';

export default async function EventsPageView() {
  const session = await getAuth0().getSession();

  if (!session) {
    redirect('/auth/login?returnTo=%2Fevents');
  }

  let events: EventsPage;

  try {
    events = await getEvents();
  } catch {
    return (
      <main style={{ maxWidth: 720, margin: '64px auto', padding: 24 }}>
        <h1>Eventos</h1>
        <p style={{ margin: '16px 0' }}>
          No pudimos consultar los eventos. Comprueba tus permisos o vuelve a
          iniciar sesión.
        </p>
        <a href="/auth/login?returnTo=%2Fevents">Volver a iniciar sesión</a>
        <p style={{ marginTop: 16 }}>
          <a href="/account">Volver a tu cuenta</a>
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: '64px auto', padding: 24 }}>
      <p>BACKSTAGE · PRODUCCIÓN DE EVENTOS</p>
      <h1 style={{ margin: '16px 0' }}>Eventos</h1>
      <p>Total de eventos: {events.total}</p>

      {events.items.length ? (
        <ul style={{ margin: '24px 0', paddingLeft: 24 }}>
          {events.items.map((event) => (
            <li key={event.id} style={{ marginBottom: 12 }}>
              <strong>{event.title}</strong> · {event.status}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: '24px 0' }}>Todavía no hay eventos.</p>
      )}

      <a href="/account">Volver a tu cuenta</a>
    </main>
  );
}
