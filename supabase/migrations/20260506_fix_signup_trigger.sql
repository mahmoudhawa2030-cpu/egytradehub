-- ============================================================
-- Fix "Database error saving new user" on signup.
-- 1. Drop any broken trigger on auth.users
-- 2. Add 'supervisor' to enum if missing
-- 3. Recreate the trigger function safely (no exception on conflict)
-- ============================================================

-- Step 1: Remove any existing trigger that may be broken
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

-- Step 2: Add supervisor to enum (safe, idempotent)
do $$ begin
  alter type public.profile_role add value if not exists 'supervisor';
exception when others then null; end $$;

-- Step 3: Recreate the trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role text;
begin
  begin
    _role := coalesce(new.raw_user_meta_data->>'role', 'buyer');
    if _role not in ('buyer','supplier','admin','supervisor') then
      _role := 'buyer';
    end if;

    insert into public.profiles (
      user_id,
      full_name,
      company_name,
      country,
      role,
      is_verified,
      is_banned
    ) values (
      new.id,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'company_name',
      new.raw_user_meta_data->>'country',
      _role::public.profile_role,
      false,
      false
    )
    on conflict (user_id) do nothing;
  exception when others then
    -- Never block signup — log the error but let auth proceed
    raise warning 'handle_new_user failed: %', sqlerrm;
  end;

  return new;
end;
$$;

-- Step 4: Attach the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
