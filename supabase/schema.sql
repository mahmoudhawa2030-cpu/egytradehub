-- TradeHub (egytradehub) — Supabase schema
-- Run this in the Supabase SQL editor or via `supabase db push`.

-- =============================================================
-- 1. ENUMS
-- =============================================================
do $$ begin
  create type profile_role as enum ('buyer', 'supplier', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rfq_status as enum ('pending', 'replied', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('processing', 'in_transit', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

-- =============================================================
-- 2. PROFILES
-- =============================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role profile_role not null default 'buyer',
  full_name text,
  company_name text,
  country text,
  is_verified boolean not null default false,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 3. PRODUCTS
-- =============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.profiles(user_id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  base_price numeric(12,2) not null check (base_price >= 0),
  moq integer not null default 1 check (moq > 0),
  image_url text,
  price_tiers jsonb,
  is_flash_deal boolean not null default false,
  flash_starts_at timestamptz,
  flash_ends_at timestamptz,
  flash_discount_pct numeric(5,2),
  stock_claimed_pct numeric(5,2),
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_supplier_idx on public.products(supplier_id);
create index if not exists products_flash_idx on public.products(is_flash_deal) where is_flash_deal = true;

-- =============================================================
-- 4. RFQs (Request for Quote)
-- =============================================================
create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(user_id) on delete cascade,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  target_price numeric(12,2),
  country text,
  notes text,
  status rfq_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists rfqs_buyer_idx on public.rfqs(buyer_id);
create index if not exists rfqs_status_idx on public.rfqs(status);

-- =============================================================
-- 5. ORDERS
-- =============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(user_id) on delete cascade,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  status order_status not null default 'processing',
  tracking_details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists orders_buyer_idx on public.orders(buyer_id);
create index if not exists orders_status_idx on public.orders(status);

-- =============================================================
-- 6. ROW LEVEL SECURITY
-- =============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.rfqs     enable row level security;
alter table public.orders   enable row level security;

-- Profiles policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Products policies
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone" on public.products
  for select using (true);

drop policy if exists "Suppliers can insert own products" on public.products;
create policy "Suppliers can insert own products" on public.products
  for insert with check (auth.uid() = supplier_id);

drop policy if exists "Suppliers can update own products" on public.products;
create policy "Suppliers can update own products" on public.products
  for update using (auth.uid() = supplier_id);

drop policy if exists "Suppliers can delete own products" on public.products;
create policy "Suppliers can delete own products" on public.products
  for delete using (auth.uid() = supplier_id);

-- RFQs policies
drop policy if exists "Buyers can view own RFQs" on public.rfqs;
create policy "Buyers can view own RFQs" on public.rfqs
  for select using (auth.uid() = buyer_id);

drop policy if exists "Buyers can create RFQs" on public.rfqs;
create policy "Buyers can create RFQs" on public.rfqs
  for insert with check (auth.uid() = buyer_id);

drop policy if exists "Buyers can update own RFQs" on public.rfqs;
create policy "Buyers can update own RFQs" on public.rfqs
  for update using (auth.uid() = buyer_id);

-- Orders policies
drop policy if exists "Buyers can view own orders" on public.orders;
create policy "Buyers can view own orders" on public.orders
  for select using (auth.uid() = buyer_id);

drop policy if exists "Buyers can create orders" on public.orders;
create policy "Buyers can create orders" on public.orders
  for insert with check (auth.uid() = buyer_id);

-- =============================================================
-- 6b. MIGRATIONS (safe to run multiple times)
-- =============================================================
alter table public.profiles add column if not exists is_banned boolean not null default false;

-- =============================================================
-- 7. ADMIN POLICIES
-- =============================================================

-- Helper: SECURITY DEFINER function bypasses RLS to avoid recursion
-- when a policy needs to check the caller's role from public.profiles.
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

-- Allow callers to use it
grant execute on function public.is_admin() to anon, authenticated;

-- Admin can read all profiles (the public "select using (true)" policy
-- already allows this; this admin policy is kept for clarity/explicitness
-- but uses the non-recursive helper)
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using ( public.is_admin() );

-- Admin can update any profile (role, is_verified)
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile" on public.profiles
  for update using ( public.is_admin() );

-- Admin can read all products
drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products" on public.products
  for select using ( public.is_admin() );

-- Admin can insert products
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products
  for insert with check ( public.is_admin() );

-- Admin can update any product
drop policy if exists "Admins can update any product" on public.products;
create policy "Admins can update any product" on public.products
  for update using ( public.is_admin() );

-- Admin can delete any product
drop policy if exists "Admins can delete any product" on public.products;
create policy "Admins can delete any product" on public.products
  for delete using ( public.is_admin() );

-- Admin can read all RFQs
drop policy if exists "Admins can view all RFQs" on public.rfqs;
create policy "Admins can view all RFQs" on public.rfqs
  for select using ( public.is_admin() );

-- Admin can update any RFQ
drop policy if exists "Admins can update any RFQ" on public.rfqs;
create policy "Admins can update any RFQ" on public.rfqs
  for update using ( public.is_admin() );

-- Admin can read all orders
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders
  for select using ( public.is_admin() );

-- Admin can update any order
drop policy if exists "Admins can update any order" on public.orders;
create policy "Admins can update any order" on public.orders
  for update using ( public.is_admin() );

-- =============================================================
-- 8. CATEGORIES
-- =============================================================
create table if not exists public.categories (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_slug_idx    on public.categories(slug);
create index if not exists categories_active_idx  on public.categories(is_active);
create index if not exists categories_sort_idx    on public.categories(sort_order);

alter table public.categories enable row level security;

-- Anyone can read active categories
drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable" on public.categories
  for select using (is_active = true);

-- Admins can do everything
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories
  for all using ( public.is_admin() );

-- Seed default categories (idempotent)
insert into public.categories (name, slug, icon, sort_order) values
  ('Electronics',  'electronics',  'Monitor',       1),
  ('Machinery',    'machinery',    'Settings',      2),
  ('Textiles',     'textiles',     'Shirt',         3),
  ('Chemicals',    'chemicals',    'FlaskConical',  4),
  ('Safety',       'safety',       'ShieldCheck',   5),
  ('Packaging',    'packaging',    'Layers',        6),
  ('Healthcare',   'healthcare',   'HeartPulse',    7),
  ('Logistics',    'logistics',    'Truck',         8),
  ('Food',         'food',         'Apple',         9),
  ('Automotive',   'automotive',   'Car',           10),
  ('Raw Materials','raw-materials','Package',       11),
  ('OEM/ODM',      'oem-odm',      'Users',         12),
  ('Other',        'other',        'MoreHorizontal',99)
on conflict (slug) do nothing;
