-- Enable Supabase Realtime for the messages table.
-- Required so INSERT/UPDATE events stream to clients via postgres_changes.

-- Make sure the table publishes full row data (needed for UPDATE payloads)
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication if not already there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
END$$;
