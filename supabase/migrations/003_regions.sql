-- Add Uganda-wide region support to existing Mark Nyumba databases.
-- Run after 001_initial_schema.sql and 002_favorites_messages_storage.sql.

alter table public.properties
  add column if not exists region text not null default 'central';

alter table public.properties
  drop constraint if exists properties_region_check;

alter table public.properties
  add constraint properties_region_check
  check (region in ('central', 'eastern', 'northern', 'western'));

create index if not exists properties_region_idx on public.properties (region);
