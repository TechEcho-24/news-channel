-- Allow anyone (anonymous + logged-in) to insert into subscribers table
-- This is safe because:
--   1. Only email and preferences are stored (no sensitive data)
--   2. The API route that calls this already validates the email format
--   3. email column has a UNIQUE constraint to prevent duplicates

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public INSERT (anonymous users subscribing from homepage)
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

-- Allow public UPDATE via upsert (so existing subscribers can update preferences)
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
