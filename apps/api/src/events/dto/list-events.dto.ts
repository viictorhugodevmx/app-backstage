import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EVENT_STATUSES } from '../event.types.js';
import type { EventStatus } from '../event.types.js';

export class ListEventsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsIn(EVENT_STATUSES)
  status?: EventStatus;
}
