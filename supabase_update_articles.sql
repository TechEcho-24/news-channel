-- Run this in Supabase SQL Editor to update articles table

ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
