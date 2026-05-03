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
-- 7. ADMIN POLICIES
-- =============================================================

-- Admin can read all profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can update any profile (role, is_verified)
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can read all products
drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products" on public.products
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can insert products
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can update any product
drop policy if exists "Admins can update any product" on public.products;
create policy "Admins can update any product" on public.products
  for update using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can delete any product
drop policy if exists "Admins can delete any product" on public.products;
create policy "Admins can delete any product" on public.products
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can read all RFQs
drop policy if exists "Admins can view all RFQs" on public.rfqs;
create policy "Admins can view all RFQs" on public.rfqs
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can update any RFQ
drop policy if exists "Admins can update any RFQ" on public.rfqs;
create policy "Admins can update any RFQ" on public.rfqs
  for update using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can read all orders
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin can update any order
drop policy if exists "Admins can update any order" on public.orders;
create policy "Admins can update any order" on public.orders
  for update using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'admin'
    )
  );
