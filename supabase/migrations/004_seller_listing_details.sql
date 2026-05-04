-- Add richer seller listing details for production property submissions.
-- Run after 001_initial_schema.sql, 002_favorites_messages_storage.sql, and 003_regions.sql.

alter table public.properties
  add column if not exists price_negotiable boolean not null default false,
  add column if not exists rent_period text,
  add column if not exists listing_status text not null default 'available',
  add column if not exists parking_spaces int,
  add column if not exists furnishing text,
  add column if not exists video_url text,
  add column if not exists virtual_tour_url text,
  add column if not exists amenities text[] default '{}',
  add column if not exists seller_name text,
  add column if not exists seller_phone text,
  add column if not exists seller_whatsapp text,
  add column if not exists seller_email text,
  add column if not exists contact_preference text not null default 'message',
  add column if not exists available_from date;

alter table public.properties
  drop constraint if exists properties_rent_period_check,
  drop constraint if exists properties_listing_status_check,
  drop constraint if exists properties_parking_spaces_check,
  drop constraint if exists properties_furnishing_check,
  drop constraint if exists properties_contact_preference_check;

alter table public.properties
  add constraint properties_rent_period_check
  check (rent_period is null or rent_period in ('day', 'week', 'month', 'year')),
  add constraint properties_listing_status_check
  check (listing_status in ('available', 'under_offer', 'sold', 'rented')),
  add constraint properties_parking_spaces_check
  check (parking_spaces is null or parking_spaces >= 0),
  add constraint properties_furnishing_check
  check (furnishing is null or furnishing in ('furnished', 'semi_furnished', 'unfurnished')),
  add constraint properties_contact_preference_check
  check (contact_preference in ('message', 'phone', 'whatsapp', 'email'));

create index if not exists properties_listing_status_idx on public.properties (listing_status);
