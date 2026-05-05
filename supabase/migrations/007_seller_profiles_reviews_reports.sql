-- Public seller profiles, ratings, and reports.
-- Run after 001_initial_schema.sql through 006_profile_email_and_privacy.sql.

alter table public.profiles
  add column if not exists seller_business_name text,
  add column if not exists seller_bio text,
  add column if not exists seller_location text,
  add column if not exists seller_verified boolean not null default false;

drop policy if exists "Public can view seller profiles" on public.profiles;
create policy "Public can view seller profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.properties p
      where p.owner_id = profiles.id
        and p.is_published = true
    )
  );

create table if not exists public.seller_reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text check (body is null or char_length(body) <= 1000),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seller_reviews_not_self check (seller_id <> reviewer_id),
  constraint seller_reviews_unique_reviewer unique (seller_id, reviewer_id)
);

create index if not exists seller_reviews_seller_idx on public.seller_reviews (seller_id, created_at desc);
create index if not exists seller_reviews_reviewer_idx on public.seller_reviews (reviewer_id);

alter table public.seller_reviews enable row level security;

drop policy if exists "Published seller reviews are public" on public.seller_reviews;
create policy "Published seller reviews are public"
  on public.seller_reviews for select
  using (is_published = true or auth.uid() = reviewer_id or public.is_admin());

drop policy if exists "Signed in users can review sellers" on public.seller_reviews;
create policy "Signed in users can review sellers"
  on public.seller_reviews for insert
  with check (
    auth.uid() = reviewer_id
    and seller_id <> auth.uid()
    and exists (
      select 1
      from public.properties p
      where p.owner_id = seller_id
        and p.is_published = true
    )
  );

drop policy if exists "Reviewers can update own seller reviews" on public.seller_reviews;
create policy "Reviewers can update own seller reviews"
  on public.seller_reviews for update
  using (auth.uid() = reviewer_id or public.is_admin())
  with check ((auth.uid() = reviewer_id and seller_id <> auth.uid()) or public.is_admin());

drop policy if exists "Reviewers and admins can delete seller reviews" on public.seller_reviews;
create policy "Reviewers and admins can delete seller reviews"
  on public.seller_reviews for delete
  using (auth.uid() = reviewer_id or public.is_admin());

create table if not exists public.seller_reports (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  reason text not null check (reason in ('fraud', 'misleading_listing', 'harassment', 'unreachable', 'other')),
  details text not null check (char_length(trim(details)) between 10 and 2000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seller_reports_not_self check (seller_id <> reporter_id)
);

create index if not exists seller_reports_seller_idx on public.seller_reports (seller_id, created_at desc);
create index if not exists seller_reports_reporter_idx on public.seller_reports (reporter_id, created_at desc);
create index if not exists seller_reports_status_idx on public.seller_reports (status, created_at desc);

alter table public.seller_reports enable row level security;

drop policy if exists "Reporters and admins can view seller reports" on public.seller_reports;
create policy "Reporters and admins can view seller reports"
  on public.seller_reports for select
  using (auth.uid() = reporter_id or public.is_admin());

drop policy if exists "Signed in users can report sellers" on public.seller_reports;
create policy "Signed in users can report sellers"
  on public.seller_reports for insert
  with check (
    auth.uid() = reporter_id
    and seller_id <> auth.uid()
    and exists (
      select 1
      from public.properties p
      where p.owner_id = seller_id
        and p.is_published = true
    )
  );

drop policy if exists "Admins can update seller reports" on public.seller_reports;
create policy "Admins can update seller reports"
  on public.seller_reports for update
  using (public.is_admin())
  with check (public.is_admin());
