import { Transform } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 80)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  slug: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(3, 120)
  title: string;

  @IsString()
  @MaxLength(3000)
  description: string = '';

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 160)
  venue: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 100)
  city: string;

  @IsISO8601({ strict: true })
  @Matches(/(Z|[+-]\d{2}:\d{2})$/)
  startsAt: string;

  @IsISO8601({ strict: true })
  @Matches(/(Z|[+-]\d{2}:\d{2})$/)
  endsAt: string;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  capacity: number;
}
