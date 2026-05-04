-- Add subcategory support to categories table
-- Run in Supabase SQL Editor

alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete cascade,
  add column if not exists thumbnail_url text;

create index if not exists categories_parent_idx on public.categories(parent_id);
