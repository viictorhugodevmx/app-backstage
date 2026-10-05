export const EVENT_STATUSES = [
  'draft',
  'planning',
  'ready',
  'live',
  'completed',
  'cancelled',
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}
