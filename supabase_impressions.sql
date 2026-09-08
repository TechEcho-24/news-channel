-- Update the RPC function to run with permissions (SECURITY DEFINER)
-- This allows any visitor to increase the view count without needing to log in.
CREATE OR REPLACE FUNCTION increment_impressions(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET impressions = COALESCE(impressions, 0) + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload schema
NOTIFY pgrst, 'reload schema';
