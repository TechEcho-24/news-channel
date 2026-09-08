-- Run this in the Supabase SQL Editor to fix the Article saving error

-- 1. Ensure RLS is enabled
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 2. Allow public to read articles
DROP POLICY IF EXISTS "Allow public read access on articles" ON public.articles;
CREATE POLICY "Allow public read access on articles" 
ON public.articles FOR SELECT 
USING (true);

-- 3. Allow admins and authors to INSERT articles
DROP POLICY IF EXISTS "Admins can insert articles" ON public.articles;
CREATE POLICY "Admins can insert articles" 
ON public.articles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'author')
  )
);

-- 4. Allow admins and authors to UPDATE articles
DROP POLICY IF EXISTS "Admins can update articles" ON public.articles;
CREATE POLICY "Admins can update articles" 
ON public.articles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'author')
  )
);

-- 5. Allow admins and authors to DELETE articles
DROP POLICY IF EXISTS "Admins can delete articles" ON public.articles;
CREATE POLICY "Admins can delete articles" 
ON public.articles FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'author')
  )
);
