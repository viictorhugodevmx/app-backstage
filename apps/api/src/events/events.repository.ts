import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import type { CreateEventDto } from './dto/create-event.dto.js';
import type { ListEventsDto } from './dto/list-events.dto.js';
import type { EventRecord } from './event.types.js';

const eventColumns = `
  id, slug, title, description, venue, city,
  starts_at AS "startsAt",
  ends_at AS "endsAt",
  capacity, status,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

@Injectable()
export class EventsRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(query: ListEventsDto) {
    const status = query.status ?? null;
    const offset = (query.page - 1) * query.limit;

    const count = await this.database.query<{ total: number }>(
      `SELECT count(*)::integer AS total
       FROM public.events
       WHERE ($1::varchar IS NULL OR status = $1)`,
      [status],
    );

    const result = await this.database.query<EventRecord>(
      `SELECT ${eventColumns}
       FROM public.events
       WHERE ($1::varchar IS NULL OR status = $1)
       ORDER BY starts_at ASC, id ASC
       LIMIT $2 OFFSET $3`,
      [status, query.limit, offset],
    );

    return {
      items: result.rows,
      total: count.rows[0]?.total ?? 0,
      page: query.page,
      limit: query.limit,
    };
  }

  async findById(id: string): Promise<EventRecord | null> {
    const result = await this.database.query<EventRecord>(
      `SELECT ${eventColumns} FROM public.events WHERE id = $1`,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async create(input: CreateEventDto): Promise<EventRecord> {
    const result = await this.database.query<EventRecord>(
      `INSERT INTO public.events
        (slug, title, description, venue, city,
         starts_at, ends_at, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${eventColumns}`,
      [
        input.slug,
        input.title,
        input.description,
        input.venue,
        input.city,
        input.startsAt,
        input.endsAt,
        input.capacity,
      ],
    );

    if (!result.rows[0]) {
      throw new Error('La creación no devolvió un evento.');
    }

    return result.rows[0];
  }

  async update(id: string, input: CreateEventDto): Promise<EventRecord | null> {
    const result = await this.database.query<EventRecord>(
      `UPDATE public.events
       SET slug = $2, title = $3, description = $4,
           venue = $5, city = $6, starts_at = $7,
           ends_at = $8, capacity = $9
       WHERE id = $1
       RETURNING ${eventColumns}`,
      [
        id,
        input.slug,
        input.title,
        input.description,
        input.venue,
        input.city,
        input.startsAt,
        input.endsAt,
        input.capacity,
      ],
    );

    return result.rows[0] ?? null;
  }

  async cancel(id: string): Promise<EventRecord | null> {
    const result = await this.database.query<EventRecord>(
      `UPDATE public.events
       SET status = 'cancelled'
       WHERE id = $1 AND status <> 'completed'
       RETURNING ${eventColumns}`,
      [id],
    );

    return result.rows[0] ?? null;
  }
}
