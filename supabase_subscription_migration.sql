-- Run this in the Supabase SQL Editor
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT false;
