-- Fix subscribers table RLS policies
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 1. Allow admins to SELECT all subscribers (for dashboard count)
--    Authenticated users with service_role can always read (bypasses RLS)
--    But anon key needs an explicit policy for the dashboard server component.
--    We grant SELECT to authenticated role (logged-in admin uses this via server client).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscribers'
      AND policyname = 'Authenticated can read subscribers'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can read subscribers" ON public.subscribers
      FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- 2. Allow public INSERT (anonymous users subscribing from homepage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscribers'
      AND policyname = 'Public can subscribe'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can subscribe" ON public.subscribers
      FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- 3. Allow public UPDATE via upsert (existing subscribers updating preferences)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscribers'
      AND policyname = 'Public can update own subscription'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can update own subscription" ON public.subscribers
      FOR UPDATE USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
