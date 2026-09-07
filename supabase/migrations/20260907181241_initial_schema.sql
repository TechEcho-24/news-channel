-- Initial Schema for Premium News & Media Platform

-- ENUMS
CREATE TYPE article_status AS ENUM ('draft', 'scheduled', 'published', 'archived');
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'spam');
CREATE TYPE subscriber_status AS ENUM ('active', 'unsubscribed', 'bounced');

-- CATEGORIES
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    color VARCHAR(50),
    description TEXT,
    seo_title VARCHAR(255),
    meta_description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBCATEGORIES
CREATE TABLE subcategories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTHORS
CREATE TABLE authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE, -- linked to auth.users if needed
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    profile_image TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ARTICLES
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subheadline TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    featured_image TEXT,
    image_alt VARCHAR(255),
    image_caption TEXT,
    source VARCHAR(255),
    source_url TEXT,
    status article_status DEFAULT 'draft',
    is_breaking BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_editor_pick BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    seo_title VARCHAR(255),
    meta_description TEXT,
    seo_keywords TEXT,
    canonical_url TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAGS
CREATE TABLE tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- ARTICLE_TAGS
CREATE TABLE article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- COMMENTS
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID, -- anonymous or logged in
    display_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    status comment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIBERS
CREATE TABLE subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status subscriber_status DEFAULT 'active',
    verified BOOLEAN DEFAULT FALSE,
    unsubscribe_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIBER_PREFERENCES
CREATE TABLE subscriber_preferences (
    subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE PRIMARY KEY,
    breaking_news BOOLEAN DEFAULT TRUE,
    daily_digest BOOLEAN DEFAULT TRUE,
    business BOOLEAN DEFAULT FALSE,
    technology BOOLEAN DEFAULT FALSE,
    markets BOOLEAN DEFAULT FALSE,
    reviews BOOLEAN DEFAULT FALSE,
    browser_notifications BOOLEAN DEFAULT FALSE
);

-- BREAKING NEWS TICKER
CREATE TABLE breaking_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
-- Enable RLS on all public tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public can read authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public can read published articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public can read article_tags" ON article_tags FOR SELECT USING (true);
CREATE POLICY "Public can read active breaking_news" ON breaking_news FOR SELECT USING (is_active = true);

-- Public can read approved comments
CREATE POLICY "Public can read approved comments" ON comments FOR SELECT USING (status = 'approved');

-- Public can insert comments (anonymous commenting enabled)
CREATE POLICY "Public can insert comments" ON comments FOR INSERT WITH CHECK (true);
