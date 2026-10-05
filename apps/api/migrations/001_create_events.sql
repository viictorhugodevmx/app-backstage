CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(80) NOT NULL UNIQUE,
  title varchar(120) NOT NULL,
  description text NOT NULL DEFAULT '',
  venue varchar(160) NOT NULL,
  city varchar(100) NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  capacity integer NOT NULL DEFAULT 100,
  status varchar(20) NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT events_slug_format
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  CONSTRAINT events_title_length
    CHECK (char_length(btrim(title)) >= 3),

  CONSTRAINT events_description_length
    CHECK (char_length(description) <= 3000),

  CONSTRAINT events_venue_length
    CHECK (char_length(btrim(venue)) >= 2),

  CONSTRAINT events_city_length
    CHECK (char_length(btrim(city)) >= 2),

  CONSTRAINT events_date_order
    CHECK (ends_at > starts_at),

  CONSTRAINT events_positive_capacity
    CHECK (capacity > 0),

  CONSTRAINT events_valid_status
    CHECK (status IN (
      'draft', 'planning', 'ready', 'live', 'completed', 'cancelled'
    ))
);

CREATE INDEX events_starts_at_idx ON public.events (starts_at);
CREATE INDEX events_status_idx ON public.events (status);

CREATE FUNCTION public.touch_event_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.touch_event_updated_at();
