import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { CreateEventDto } from './dto/create-event.dto.js';
import type { ListEventsDto } from './dto/list-events.dto.js';
import type { UpdateEventDto } from './dto/update-event.dto.js';
import { EventsRepository } from './events.repository.js';

@Injectable()
export class EventsService {
  constructor(private readonly repository: EventsRepository) {}

  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : '';

      if (code === '23505') {
        throw new ConflictException('Ya existe un evento con ese slug.');
      }

      if (['23514', '23502', '22007', '22008', '22003'].includes(code)) {
        throw new BadRequestException('Los datos del evento no son válidos.');
      }

      if (
        code.startsWith('08') ||
        [
          '57P01',
          '57P02',
          '57P03',
          '53300',
          'ECONNREFUSED',
          'ECONNRESET',
          'ETIMEDOUT',
          'ENOTFOUND',
        ].includes(code)
      ) {
        throw new ServiceUnavailableException('PostgreSQL no está disponible.');
      }

      throw new InternalServerErrorException(
        'No se pudo completar la operación del evento.',
      );
    }
  }

  private validateDates(input: CreateEventDto) {
    const start = Date.parse(input.startsAt);
    const end = Date.parse(input.endsAt);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      throw new BadRequestException(
        'La fecha final debe ser posterior a la inicial.',
      );
    }
  }

  list(query: ListEventsDto) {
    return this.execute(() => this.repository.list(query));
  }

  async findById(id: string) {
    const event = await this.execute(() => this.repository.findById(id));

    if (!event) {
      throw new NotFoundException('Evento no encontrado.');
    }

    return event;
  }

  create(input: CreateEventDto) {
    this.validateDates(input);
    return this.execute(() => this.repository.create(input));
  }

  async update(id: string, input: UpdateEventDto) {
    if (Object.values(input).every((value) => value === undefined)) {
      throw new BadRequestException('Envía al menos un campo para editar.');
    }

    const current = await this.findById(id);

    const merged: CreateEventDto = {
      slug: input.slug ?? current.slug,
      title: input.title ?? current.title,
      description: input.description ?? current.description,
      venue: input.venue ?? current.venue,
      city: input.city ?? current.city,
      startsAt: input.startsAt ?? current.startsAt.toISOString(),
      endsAt: input.endsAt ?? current.endsAt.toISOString(),
      capacity: input.capacity ?? current.capacity,
    };

    this.validateDates(merged);

    const updated = await this.execute(() =>
      this.repository.update(id, merged),
    );

    if (!updated) {
      throw new NotFoundException('Evento no encontrado.');
    }

    return updated;
  }

  async cancel(id: string) {
    const current = await this.findById(id);

    if (current.status === 'cancelled') {
      return current;
    }

    if (current.status === 'completed') {
      throw new ConflictException('Un evento completado no puede cancelarse.');
    }

    const cancelled = await this.execute(() => this.repository.cancel(id));

    if (!cancelled) {
      throw new ConflictException(
        'El evento cambió; consulta su estado antes de cancelar.',
      );
    }

    return cancelled;
  }
}
