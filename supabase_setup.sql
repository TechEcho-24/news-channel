-- Run this entire script in the Supabase SQL Editor

-- 1. Create Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subheadline TEXT,
  category TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  content TEXT NOT NULL,
  author_name TEXT DEFAULT 'Admin',
  cover_image TEXT,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Categories Table (For dynamic navigation if needed)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- 3. Insert Default Categories
INSERT INTO categories (name, slug) VALUES 
('Business', 'business'),
('Technology', 'technology'),
('Startups', 'startups'),
('Economy', 'economy'),
('India', 'india'),
('World', 'world'),
('Markets', 'markets'),
('Automobile', 'automobile'),
('Entertainment', 'entertainment'),
('Sports', 'sports'),
('Lifestyle', 'lifestyle'),
('Health', 'health'),
('Reviews', 'reviews')
ON CONFLICT (slug) DO NOTHING;

-- 4. Enable Row Level Security (RLS) but allow public reads (since it's a news site)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read articles
CREATE POLICY "Allow public read access on articles" 
ON articles FOR SELECT 
USING (true);

-- Allow anyone to read categories
CREATE POLICY "Allow public read access on categories" 
ON categories FOR SELECT 
USING (true);

-- Allow anyone to insert articles for now (Since we haven't set up full Admin Auth yet)
-- Note: In a production app, you would restrict this to authenticated users only!
CREATE POLICY "Allow anon insert on articles" 
ON articles FOR INSERT 
WITH CHECK (true);
