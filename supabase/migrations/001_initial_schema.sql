-- Mark Nyumba — initial schema (run in Supabase SQL Editor or via CLI)

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'admin'
  );
$$;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users and admins can view profiles" on public.profiles;
create policy "Users and admins can view profiles"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'user');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'user');

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Properties
do $$
begin
  if not exists (select 1 from pg_type where typname = 'listing_type' and typnamespace = 'public'::regnamespace) then
    create type public.listing_type as enum ('sale', 'rent');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'property_category' and typnamespace = 'public'::regnamespace) then
    create type public.property_category as enum ('house', 'apartment', 'land', 'commercial', 'other');
  end if;
end
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  listing_type public.listing_type not null,
  property_category public.property_category not null,
  price numeric(14, 2) not null check (price >= 0),
  currency text not null default 'UGX',
  price_negotiable boolean not null default false,
  rent_period text check (rent_period is null or rent_period in ('day', 'week', 'month', 'year')),
  listing_status text not null default 'available' check (listing_status in ('available', 'under_offer', 'sold', 'rented')),
  region text not null check (region in ('central', 'eastern', 'northern', 'western')),
  city text not null,
  district text,
  address_line text,
  bedrooms int check (bedrooms is null or bedrooms >= 0),
  bathrooms int check (bathrooms is null or bathrooms >= 0),
  parking_spaces int check (parking_spaces is null or parking_spaces >= 0),
  furnishing text check (furnishing is null or furnishing in ('furnished', 'semi_furnished', 'unfurnished')),
  land_size_sqm numeric(14, 2),
  built_size_sqm numeric(14, 2),
  image_urls text[] default '{}',
  video_url text,
  virtual_tour_url text,
  amenities text[] default '{}',
  seller_name text,
  seller_phone text,
  seller_whatsapp text,
  seller_email text,
  contact_preference text not null default 'message' check (contact_preference in ('message', 'phone', 'whatsapp', 'email')),
  available_from date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_listing_type_idx on public.properties (listing_type);
create index if not exists properties_category_idx on public.properties (property_category);
create index if not exists properties_region_idx on public.properties (region);
create index if not exists properties_city_idx on public.properties (city);
create index if not exists properties_owner_idx on public.properties (owner_id);
create index if not exists properties_created_idx on public.properties (created_at desc);

alter table public.properties enable row level security;

drop policy if exists "Published properties are viewable by everyone" on public.properties;
create policy "Published properties are viewable by everyone"
  on public.properties for select
  using (is_published = true or auth.uid() = owner_id or public.is_admin());

drop policy if exists "Authenticated users can insert own properties" on public.properties;
create policy "Authenticated users can insert own properties"
  on public.properties for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can update own properties" on public.properties;
create policy "Owners can update own properties"
  on public.properties for update
  using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "Owners can delete own properties" on public.properties;
create policy "Owners can delete own properties"
  on public.properties for delete
  using (auth.uid() = owner_id or public.is_admin());

-- Storage bucket and policies are created in 002_favorites_messages_storage.sql.
