-- Add specifications JSONB column to products table for cement and other product types
alter table public.products add column if not exists specifications jsonb default null;

-- Add comment explaining the structure
comment on column public.products.specifications is 'Product specifications as key-value pairs. Example for cement: {"Type": "Portland Cement", "Strength Grade": "52.5R", "Place of Origin": "Egypt", ...}';
