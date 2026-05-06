-- Add gallery_images array column to products
alter table public.products
  add column if not exists gallery_images text[] not null default '{}';
