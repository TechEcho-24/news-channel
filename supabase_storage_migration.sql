-- Run this in Supabase SQL Editor to create a storage bucket for images

-- Create a new bucket named 'article_images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('article_images', 'article_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'article_images');

-- Allow authenticated admins to upload images
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article_images' AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'author')
  )
);
