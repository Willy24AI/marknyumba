-- Store profile emails for admin user management and tighten profile reads.
-- Run after 001_initial_schema.sql through 005_admin_roles.sql.

alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

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

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users and admins can view profiles" on public.profiles;
create policy "Users and admins can view profiles"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can delete conversations" on public.conversations;
create policy "Admins can delete conversations"
  on public.conversations for delete
  using (public.is_admin());

drop policy if exists "Admins can delete messages" on public.messages;
create policy "Admins can delete messages"
  on public.messages for delete
  using (public.is_admin());
