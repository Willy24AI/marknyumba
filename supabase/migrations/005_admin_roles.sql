-- Add admin role support and admin RLS permissions.
-- Run after 001_initial_schema.sql through 004_seller_listing_details.sql.

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

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

drop policy if exists "Published properties are viewable by everyone" on public.properties;
create policy "Published properties are viewable by everyone"
  on public.properties for select
  using (is_published = true or auth.uid() = owner_id or public.is_admin());

drop policy if exists "Owners can update own properties" on public.properties;
create policy "Owners can update own properties"
  on public.properties for update
  using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "Owners can delete own properties" on public.properties;
create policy "Owners can delete own properties"
  on public.properties for delete
  using (auth.uid() = owner_id or public.is_admin());

drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id or public.is_admin());

drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
  on public.messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );
