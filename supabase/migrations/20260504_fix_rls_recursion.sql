-- Fix infinite recursion in profiles RLS policies.
-- Run this once in Supabase SQL editor.

-- 1. Helper function: bypasses RLS via SECURITY DEFINER
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- 2. Replace recursive admin policies on profiles
drop policy if exists "Admins can view all profiles"   on public.profiles;
drop policy if exists "Admins can update any profile"  on public.profiles;

create policy "Admins can view all profiles"  on public.profiles
  for select using ( public.is_admin() );

create policy "Admins can update any profile" on public.profiles
  for update using ( public.is_admin() );

-- 3. Replace recursive admin policies on products
drop policy if exists "Admins can view all products"   on public.products;
drop policy if exists "Admins can insert products"     on public.products;
drop policy if exists "Admins can update any product"  on public.products;
drop policy if exists "Admins can delete any product"  on public.products;

create policy "Admins can view all products"   on public.products for select using ( public.is_admin() );
create policy "Admins can insert products"     on public.products for insert with check ( public.is_admin() );
create policy "Admins can update any product"  on public.products for update using ( public.is_admin() );
create policy "Admins can delete any product"  on public.products for delete using ( public.is_admin() );

-- 4. Replace recursive admin policies on rfqs
drop policy if exists "Admins can view all RFQs"    on public.rfqs;
drop policy if exists "Admins can update any RFQ"   on public.rfqs;

create policy "Admins can view all RFQs"  on public.rfqs for select using ( public.is_admin() );
create policy "Admins can update any RFQ" on public.rfqs for update using ( public.is_admin() );

-- 5. Replace recursive admin policies on orders
drop policy if exists "Admins can view all orders"   on public.orders;
drop policy if exists "Admins can update any order"  on public.orders;

create policy "Admins can view all orders"   on public.orders for select using ( public.is_admin() );
create policy "Admins can update any order"  on public.orders for update using ( public.is_admin() );

-- 6. Replace recursive admin policy on categories (if table exists)
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'categories') then
    drop policy if exists "Admins can manage categories" on public.categories;
    create policy "Admins can manage categories" on public.categories for all using ( public.is_admin() );
  end if;
end $$;
