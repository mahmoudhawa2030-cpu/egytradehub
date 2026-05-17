-- Add attachment support to messages table
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_url  text,
  ADD COLUMN IF NOT EXISTS attachment_type text,  -- 'image' | 'file'
  ADD COLUMN IF NOT EXISTS attachment_name text;

-- Storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to chat-attachments
DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow public read of chat attachments
DROP POLICY IF EXISTS "Public read chat attachments" ON storage.objects;
CREATE POLICY "Public read chat attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-attachments');
