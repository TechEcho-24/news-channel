-- Run this script in your Supabase SQL Editor to add CTA button support and new slots

-- 1. Add cta_text column to ads table
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS cta_text TEXT;

-- 2. Add new slot values to ad_slot enum if needed
ALTER TYPE ad_slot ADD VALUE IF NOT EXISTS 'footer';
ALTER TYPE ad_slot ADD VALUE IF NOT EXISTS 'nav_top';
