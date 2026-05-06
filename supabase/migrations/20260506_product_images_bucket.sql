-- Create public storage bucket for product images
-- Run in Supabase SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Allow public read
create policy "Public read product images" on storage.objects
  for select using ( bucket_id = 'product-images' );

-- Allow authenticated users (suppliers/admins) to upload
create policy "Authenticated users can upload product images" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );

-- Allow users to delete their own uploads (by matching path prefix or any authenticated)
create policy "Authenticated users can delete product images" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
  );
