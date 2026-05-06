-- Add product_id and supplier_id to rfqs for per-product inquiries
alter table public.rfqs
  add column if not exists product_id  uuid references public.products(id) on delete set null,
  add column if not exists supplier_id uuid references public.profiles(user_id) on delete set null;

create index if not exists rfqs_product_idx  on public.rfqs(product_id);
create index if not exists rfqs_supplier_idx on public.rfqs(supplier_id);

-- Suppliers can view RFQs directed at them
drop policy if exists "Suppliers can view their RFQs" on public.rfqs;
create policy "Suppliers can view their RFQs" on public.rfqs
  for select using (auth.uid() = supplier_id);
