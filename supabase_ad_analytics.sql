-- Run this script in your Supabase SQL Editor to enable ad analytics (views & clicks tracking)

-- 1. Add impressions, clicks, and cta_text columns to public.ads table
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS impressions INT DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS clicks INT DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS cta_text TEXT;

-- 2. RPC function to increment ad impressions atomically (+1 per trigger)
CREATE OR REPLACE FUNCTION increment_ad_impression(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ads
  SET impressions = COALESCE(impressions, 0) + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC function to increment ad clicks atomically (+1 per click)
CREATE OR REPLACE FUNCTION increment_ad_click(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ads
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
