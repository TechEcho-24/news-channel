-- Run this script in the Supabase SQL Editor to setup Roles & Profiles

-- 1. Create a Custom Enum for Roles safely
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'author', 'reader');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'reader'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;

-- Allow anyone to read profiles (fixes infinite recursion)
CREATE POLICY "Anyone can view profiles" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Super admins can update profiles" ON public.profiles;
CREATE POLICY "Super admins can update profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger removed. We will handle profile creation in the Application layer (Next.js)
-- to avoid opaque "Database error creating new user" errors.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();


-- 5. Add a Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Safely recreate comment policies
DROP POLICY IF EXISTS "Allow public read access on comments" ON public.comments;
CREATE POLICY "Allow public read access on comments" 
ON public.comments FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Logged in users can insert comments" ON public.comments;
CREATE POLICY "Logged in users can insert comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
