-- =============================================================
-- Add SEO-friendly slug column to products
-- =============================================================

-- 1. Add the column (nullable first so backfill works)
alter table public.products
  add column if not exists slug text;

-- 2. Backfill existing rows with unique slugs based on name
--    Uses row_number() over products with the same base slug to suffix duplicates.
with base as (
  select
    id,
    regexp_replace(
      regexp_replace(lower(coalesce(name, 'product')), '[^a-z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ) as base_slug
  from public.products
  where slug is null
),
numbered as (
  select
    id,
    base_slug,
    row_number() over (partition by base_slug order by id) as rn
  from base
)
update public.products p
set slug = case
  when n.rn = 1 then n.base_slug
  else n.base_slug || '-' || n.rn
end
from numbered n
where p.id = n.id;

-- 3. Enforce NOT NULL + uniqueness going forward
alter table public.products
  alter column slug set not null;

create unique index if not exists products_slug_unique_idx
  on public.products (slug);
