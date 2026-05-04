-- ============================================================
-- Supervisor role + messages table
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add 'supervisor' to the role enum
alter type public.user_role add value if not exists 'supervisor';

-- 2. Messages table (live chat between users + supervisor support)
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(user_id) on delete cascade,
  receiver_id  uuid references public.profiles(user_id) on delete cascade,
  room_id      text not null,           -- e.g. 'support' or 'user:<uuid>:<uuid>'
  content      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists messages_room_idx      on public.messages(room_id);
create index if not exists messages_sender_idx    on public.messages(sender_id);
create index if not exists messages_receiver_idx  on public.messages(receiver_id);
create index if not exists messages_created_idx   on public.messages(created_at desc);

alter table public.messages enable row level security;

-- Users can read messages in rooms they belong to
create policy "Users can read their messages" on public.messages
  for select using (
    sender_id = auth.uid() or receiver_id = auth.uid()
  );

-- Users can send messages
create policy "Users can send messages" on public.messages
  for insert with check (sender_id = auth.uid());

-- Supervisors and admins can read ALL messages (support)
create policy "Supervisors can read all messages" on public.messages
  for select using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role in ('admin', 'supervisor')
    )
  );

-- Supervisors and admins can send messages to anyone
create policy "Supervisors can send messages" on public.messages
  for insert with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role in ('admin', 'supervisor')
    )
  );

-- 3. is_supervisor helper (mirrors is_admin pattern)
create or replace function public.is_supervisor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role in ('admin', 'supervisor')
  );
$$;

grant execute on function public.is_supervisor() to anon, authenticated;

-- 4. Supervisors can read all profiles (for user management)
drop policy if exists "Supervisors can view all profiles" on public.profiles;
create policy "Supervisors can view all profiles" on public.profiles
  for select using ( public.is_supervisor() );

-- 5. Supervisors can suspend/ban users (update is_banned only — enforced in app logic)
drop policy if exists "Supervisors can update profiles" on public.profiles;
create policy "Supervisors can update profiles" on public.profiles
  for update using ( public.is_supervisor() );

-- 6. Supervisors can read all products/rfqs for moderation
drop policy if exists "Supervisors can view all products" on public.products;
create policy "Supervisors can view all products" on public.products
  for select using ( public.is_supervisor() );

drop policy if exists "Supervisors can update products" on public.products;
create policy "Supervisors can update products" on public.products
  for update using ( public.is_supervisor() );

drop policy if exists "Supervisors can view all RFQs" on public.rfqs;
create policy "Supervisors can view all RFQs" on public.rfqs
  for select using ( public.is_supervisor() );

drop policy if exists "Supervisors can update RFQs" on public.rfqs;
create policy "Supervisors can update RFQs" on public.rfqs
  for update using ( public.is_supervisor() );
