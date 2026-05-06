-- Allow supervisors (and admins) to insert and delete products
drop policy if exists "Supervisors can insert products" on public.products;
create policy "Supervisors can insert products" on public.products
  for insert with check ( public.is_supervisor() );

drop policy if exists "Supervisors can delete products" on public.products;
create policy "Supervisors can delete products" on public.products
  for delete using ( public.is_supervisor() );
