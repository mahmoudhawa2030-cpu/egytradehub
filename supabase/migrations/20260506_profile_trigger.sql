-- ============================================================
-- Auto-create profile row when a new auth user is created.
-- Reads role/full_name/company_name/country from raw_user_meta_data
-- so the signup form values are always preserved.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role text;
begin
  -- Default to 'buyer' if no role supplied
  _role := coalesce(new.raw_user_meta_data->>'role', 'buyer');
  -- Clamp to known values for safety
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
    _role,
    false,
    false
  )
  on conflict (user_id) do nothing;   -- never overwrite an existing profile

  return new;
end;
$$;

-- Drop old trigger if it exists, then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
