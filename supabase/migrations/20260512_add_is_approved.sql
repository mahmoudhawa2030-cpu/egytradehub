-- Add is_approved column to products for manual approval workflow
alter table public.products add column if not exists is_approved boolean not null default false;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS products_approved_idx ON public.products(is_approved);
