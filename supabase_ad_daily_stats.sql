-- Run this script in your Supabase SQL Editor to enable daily ad analytics breakdown (Daily Views & Clicks Chart)

-- 1. Create ad_daily_stats table
CREATE TABLE IF NOT EXISTS public.ad_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(ad_id, date)
);

-- Index for quick lookup by ad_id and date
CREATE INDEX IF NOT EXISTS idx_ad_daily_stats_ad_date ON public.ad_daily_stats(ad_id, date DESC);

-- Enable RLS
ALTER TABLE public.ad_daily_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access (or authenticated admin)
CREATE POLICY "Allow public read ad_daily_stats" ON public.ad_daily_stats FOR SELECT USING (true);
CREATE POLICY "Allow service_role all ad_daily_stats" ON public.ad_daily_stats FOR ALL USING (true);

-- 2. RPC to record daily impression atomically
CREATE OR REPLACE FUNCTION record_daily_ad_impression(p_ad_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO public.ad_daily_stats (ad_id, date, impressions, clicks)
  VALUES (p_ad_id, p_date, 1, 0)
  ON CONFLICT (ad_id, date)
  DO UPDATE SET impressions = public.ad_daily_stats.impressions + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC to record daily click atomically
CREATE OR REPLACE FUNCTION record_daily_ad_click(p_ad_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO public.ad_daily_stats (ad_id, date, impressions, clicks)
  VALUES (p_ad_id, p_date, 0, 1)
  ON CONFLICT (ad_id, date)
  DO UPDATE SET clicks = public.ad_daily_stats.clicks + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
