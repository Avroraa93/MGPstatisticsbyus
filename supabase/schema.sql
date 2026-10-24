-- APEX GP initial schema for Supabase PostgreSQL.
-- Apply in Supabase Dashboard -> SQL Editor. Keep private notes and credentials out of public tables.
create extension if not exists pgcrypto;

create table if not exists public.circuits (
  id text primary key,
  name text not null,
  country text not null,
  latitude double precision,
  longitude double precision,
  timezone text,
  created_at timestamptz not null default now()
);

create table if not exists public.riders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  number integer,
  team text,
  active boolean not null default true,
  profile_source text,
  updated_at timestamptz not null default now(),
  unique(name, number)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  circuit_id text references public.circuits(id),
  season integer not null,
  session_type text not null,
  session_name text,
  starts_at timestamptz,
  source_name text not null,
  source_url text,
  fetched_at timestamptz not null default now()
);

create table if not exists public.lap_times (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  rider_id uuid not null references public.riders(id),
  lap_number integer not null,
  lap_time_ms integer,
  sector_1_ms integer,
  sector_2_ms integer,
  sector_3_ms integer,
  sector_4_ms integer,
  position integer,
  gap_ms integer,
  source_name text not null,
  recorded_at timestamptz,
  unique(session_id, rider_id, lap_number)
);

create table if not exists public.race_events (
  id bigint generated always as identity primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  rider_id uuid references public.riders(id),
  lap_number integer,
  event_type text not null,
  description text not null,
  source_name text not null,
  source_url text,
  published_at timestamptz,
  fetched_at timestamptz not null default now()
);

create table if not exists public.rider_updates (
  id bigint generated always as identity primary key,
  rider_id uuid references public.riders(id),
  category text not null check (category in ('injury','team_statement','news','availability')),
  headline text not null,
  summary text not null,
  source_name text not null,
  source_url text not null,
  published_at timestamptz,
  verified_at timestamptz not null default now(),
  status_label text
);

create table if not exists public.weather_snapshots (
  id bigint generated always as identity primary key,
  circuit_id text references public.circuits(id),
  observed_at timestamptz,
  temperature_c numeric,
  track_temperature_c numeric,
  humidity_pct numeric,
  wind_kmh numeric,
  gust_kmh numeric,
  rain_mm numeric,
  rain_probability_pct numeric,
  source_name text not null,
  fetched_at timestamptz not null default now()
);

create table if not exists public.prediction_snapshots (
  id bigint generated always as identity primary key,
  session_id uuid references public.sessions(id),
  rider_id uuid not null references public.riders(id),
  win_probability numeric not null check (win_probability between 0 and 100),
  podium_probability numeric check (podium_probability between 0 and 100),
  model_version text not null,
  feature_summary jsonb not null default '{}'::jsonb,
  source_cutoff_at timestamptz,
  calculated_at timestamptz not null default now()
);

-- Public read access only for curated, non-sensitive racing data.
alter table public.circuits enable row level security;
alter table public.riders enable row level security;
alter table public.sessions enable row level security;
alter table public.lap_times enable row level security;
alter table public.race_events enable row level security;
alter table public.rider_updates enable row level security;
alter table public.weather_snapshots enable row level security;
alter table public.prediction_snapshots enable row level security;

do $$ begin
  create policy "public read circuits" on public.circuits for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read riders" on public.riders for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read sessions" on public.sessions for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read lap times" on public.lap_times for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read race events" on public.race_events for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read rider updates" on public.rider_updates for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read weather snapshots" on public.weather_snapshots for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public read prediction snapshots" on public.prediction_snapshots for select using (true);
exception when duplicate_object then null; end $$;

insert into public.circuits (id,name,country,latitude,longitude,timezone) values
('phillip','Phillip Island','Australia',-38.503,145.237,'Australia/Melbourne'),
('mugello','Mugello','Italy',43.997,11.371,'Europe/Rome'),
('misano','Misano','Italy',43.961,12.685,'Europe/Rome'),
('sepang','Sepang','Malaysia',2.760,101.738,'Asia/Kuala_Lumpur'),
('assen','Assen','Netherlands',52.963,6.524,'Europe/Amsterdam'),
('catalunya','Barcelona-Catalunya','Spain',41.570,2.261,'Europe/Madrid')
on conflict (id) do nothing;
