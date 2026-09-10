-- Allow updates to articles
CREATE POLICY "Allow anon update on articles" 
ON public.articles 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow deletions from articles
CREATE POLICY "Allow anon delete on articles" 
ON public.articles 
FOR DELETE 
USING (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
