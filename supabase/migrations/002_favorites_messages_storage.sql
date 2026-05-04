-- Favorites, messaging, storage (run after 001_initial_schema.sql)

-- ─── Favorites ─────────────────────────────────────────
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);
create index if not exists favorites_property_idx on public.favorites (property_id);

alter table public.favorites enable row level security;

drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users add own favorites" on public.favorites;
create policy "Users add own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users remove own favorites" on public.favorites;
create policy "Users remove own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ─── Conversations (one thread per buyer + listing) ─────
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_buyer_not_seller check (buyer_id <> seller_id),
  constraint conversations_unique_property_buyer unique (property_id, buyer_id)
);

create index if not exists conversations_buyer_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_idx on public.conversations (seller_id);
create index if not exists conversations_property_idx on public.conversations (property_id);
create index if not exists conversations_updated_idx on public.conversations (updated_at desc);

alter table public.conversations enable row level security;

drop policy if exists "Participants can view conversations" on public.conversations;
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id or public.is_admin());

drop policy if exists "Admins can delete conversations" on public.conversations;
create policy "Admins can delete conversations"
  on public.conversations for delete
  using (public.is_admin());

drop policy if exists "Buyers can start a conversation" on public.conversations;
create policy "Buyers can start a conversation"
  on public.conversations for insert
  with check (
    auth.uid() = buyer_id
    and seller_id = (select p.owner_id from public.properties p where p.id = property_id)
  );

-- ─── Messages ──────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0 and char_length(body) <= 5000),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
  on public.messages for select
  using (
    public.is_admin()
    or
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Admins can delete messages" on public.messages;
create policy "Admins can delete messages"
  on public.messages for delete
  using (public.is_admin());

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.touch_conversation_on_message();

-- ─── Storage: property images ─────────────────────────
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = excluded.public;

-- Policies (ignore errors if policies already exist — drop/recreate for idempotency in dev)
drop policy if exists "Property images public read" on storage.objects;
create policy "Property images public read"
  on storage.objects for select
  using (bucket_id = 'property-images');

drop policy if exists "Users upload own property folder" on storage.objects;
create policy "Users upload own property folder"
  on storage.objects for insert
  with check (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own property folder" on storage.objects;
create policy "Users update own property folder"
  on storage.objects for update
  using (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own property folder" on storage.objects;
create policy "Users delete own property folder"
  on storage.objects for delete
  using (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
