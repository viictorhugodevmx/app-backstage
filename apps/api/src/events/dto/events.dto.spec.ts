import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { createValidationPipe } from '../../common/validation.js';
import { CreateEventDto } from './create-event.dto.js';
import { ListEventsDto } from './list-events.dto.js';

const validEvent = {
  slug: 'evento-de-prueba',
  title: 'Evento de prueba',
  venue: 'Foro de prueba',
  city: 'Tuxtla',
  startsAt: '2026-11-01T18:00:00-06:00',
  endsAt: '2026-11-01T22:00:00-06:00',
  capacity: 100,
};

function validateEvent(value: unknown) {
  return createValidationPipe().transform(value, {
    type: 'body',
    metatype: CreateEventDto,
  });
}

describe('Validación de eventos', () => {
  it('acepta datos válidos y elimina espacios exteriores del título', async () => {
    const result = await validateEvent({
      ...validEvent,
      title: '  Evento de prueba  ',
    });

    expect(result).toBeInstanceOf(CreateEventDto);
    expect(result.title).toBe('Evento de prueba');
    expect(result.description).toBe('');
  });

  it('rechaza capacidad cero', async () => {
    await expect(
      validateEvent({ ...validEvent, capacity: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza campos que el cliente no debe establecer', async () => {
    await expect(
      validateEvent({ ...validEvent, status: 'ready' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza fechas sin zona horaria', async () => {
    await expect(
      validateEvent({
        ...validEvent,
        startsAt: '2026-11-01T18:00:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('transforma la paginación recibida como texto', async () => {
    const result = await createValidationPipe().transform(
      { page: '2', limit: '10', status: 'draft' },
      { type: 'query', metatype: ListEventsDto },
    );

    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.status).toBe('draft');
  });

  it('rechaza un límite mayor a cien', async () => {
    await expect(
      createValidationPipe().transform(
        { limit: '101' },
        { type: 'query', metatype: ListEventsDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
