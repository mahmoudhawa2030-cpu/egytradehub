-- ============================================================
-- Allow supervisors to take over any conversation room.
-- Adds a room-based read policy so original participants
-- still see messages a supervisor injects into their room
-- (where the supervisor is neither sender nor receiver of
-- some prior messages).
-- ============================================================

-- Helper: did auth.uid() ever participate in this room?
create or replace function public.user_in_room(rid text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.messages
    where room_id = rid
      and (sender_id = auth.uid() or receiver_id = auth.uid())
  );
$$;

grant execute on function public.user_in_room(text) to anon, authenticated;

-- Read policy: any user who has at least one message in the room
-- (as sender or receiver) can read every message in that room.
-- This means a supervisor's intervention (sender=supervisor,
-- receiver=one participant) is visible to the OTHER participant too.
drop policy if exists "Users can read messages in their rooms" on public.messages;
create policy "Users can read messages in their rooms" on public.messages
  for select using ( public.user_in_room(room_id) );

-- ============================================================
-- Harden supervisor message policies to use SECURITY DEFINER
-- helper so they don't depend on profiles RLS being permissive.
-- ============================================================

-- Make sure the helper exists (idempotent rewrite of 20260505 version)
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

-- Replace the inline EXISTS-based supervisor policies with helper-based ones
drop policy if exists "Supervisors can read all messages" on public.messages;
create policy "Supervisors can read all messages" on public.messages
  for select to authenticated
  using ( public.is_supervisor() );

drop policy if exists "Supervisors can send messages" on public.messages;
create policy "Supervisors can send messages" on public.messages
  for insert to authenticated
  with check ( public.is_supervisor() );

drop policy if exists "Supervisors can update messages" on public.messages;
create policy "Supervisors can update messages" on public.messages
  for update to authenticated
  using ( public.is_supervisor() )
  with check ( public.is_supervisor() );

-- ============================================================
-- Diagnostic queries (run manually to verify):
--   select auth.uid();                  -- should be your user id
--   select public.is_supervisor();      -- should return true
--   select role from public.profiles where user_id = auth.uid();
--   select count(*) from public.messages;  -- should be all messages
-- ============================================================
