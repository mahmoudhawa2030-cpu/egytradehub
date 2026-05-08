-- Add sample_price column to products
alter table public.products
  add column if not exists sample_price numeric(12,2) default null;
