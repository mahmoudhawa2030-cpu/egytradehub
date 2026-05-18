-- Allow message receiver to update their own is_read flag (for read receipts / blue ticks)
DROP POLICY IF EXISTS "Receivers can mark messages read" ON public.messages;
CREATE POLICY "Receivers can mark messages read"
ON public.messages
FOR UPDATE
TO authenticated
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- Supervisors/admins can update any message (e.g. to mark as read in support)
DROP POLICY IF EXISTS "Supervisors can update messages" ON public.messages;
CREATE POLICY "Supervisors can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'supervisor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'supervisor')
  )
);
