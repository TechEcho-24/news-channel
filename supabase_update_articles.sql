-- 1. Run this to make sure the columns exist
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- 2. Run this to force Supabase to reload the schema cache so it recognizes the new columns immediately
NOTIFY pgrst, 'reload schema';
