-- Create public storage bucket for category thumbnails
-- Run in Supabase SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'category-thumbnails',
  'category-thumbnails',
  true,
  2097152,  -- 2 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Allow public read
create policy "Public read category thumbnails" on storage.objects
  for select using ( bucket_id = 'category-thumbnails' );

-- Allow admins and supervisors to upload
create policy "Admins can upload category thumbnails" on storage.objects
  for insert with check (
    bucket_id = 'category-thumbnails'
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role in ('admin', 'supervisor')
    )
  );

-- Allow admins and supervisors to delete
create policy "Admins can delete category thumbnails" on storage.objects
  for delete using (
    bucket_id = 'category-thumbnails'
    and exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role in ('admin', 'supervisor')
    )
  );
