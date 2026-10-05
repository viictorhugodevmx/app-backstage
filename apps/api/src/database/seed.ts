import type { Client } from 'pg';

export const demoEvents = [
  {
    slug: 'sesiones-del-sur',
    title: 'Sesiones del Sur',
    description: 'Encuentro ficticio de música independiente.',
    venue: 'Foro del Sur',
    city: 'Tuxtla Gutiérrez',
    startsAt: '2026-11-14T19:00:00-06:00',
    endsAt: '2026-11-14T23:00:00-06:00',
    capacity: 300,
    status: 'planning',
  },
  {
    slug: 'ruido-en-el-centro',
    title: 'Ruido en el Centro',
    description: 'Producción ficticia de una noche de rock.',
    venue: 'Foro Central',
    city: 'Morelia',
    startsAt: '2026-11-21T18:00:00-06:00',
    endsAt: '2026-11-21T22:30:00-06:00',
    capacity: 450,
    status: 'draft',
  },
  {
    slug: 'frecuencia-nocturna',
    title: 'Frecuencia Nocturna',
    description: 'Evento ficticio de electrónica y arte visual.',
    venue: 'Bodega Frecuencia',
    city: 'Ciudad de México',
    startsAt: '2026-11-28T20:00:00-06:00',
    endsAt: '2026-11-29T02:00:00-06:00',
    capacity: 600,
    status: 'planning',
  },
] as const;

export async function seedEvents(client: Client) {
  let inserted = 0;

  for (const event of demoEvents) {
    const result = await client.query(
      `INSERT INTO public.events
        (slug, title, description, venue, city,
         starts_at, ends_at, capacity, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (slug) DO NOTHING`,
      [
        event.slug,
        event.title,
        event.description,
        event.venue,
        event.city,
        event.startsAt,
        event.endsAt,
        event.capacity,
        event.status,
      ],
    );

    inserted += result.rowCount ?? 0;
  }

  return inserted;
}
