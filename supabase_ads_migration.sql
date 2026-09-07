-- Run this in Supabase SQL Editor

-- Create Ad Slots Enum
DO $$ BEGIN
    CREATE TYPE ad_slot AS ENUM ('leaderboard', 'sidebar', 'in_article', 'homepage_hero');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Ads Table
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  slot ad_slot NOT NULL,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Anyone can read active ads (for displaying on the site)
DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;
CREATE POLICY "Public can view active ads"
ON public.ads FOR SELECT
USING (is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW()));

-- Only admins can manage ads (insert/update/delete)
DROP POLICY IF EXISTS "Admins can manage ads" ON public.ads;
CREATE POLICY "Admins can manage ads"
ON public.ads FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'author')
  )
);
