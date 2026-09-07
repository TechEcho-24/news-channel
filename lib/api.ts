import { supabase } from "./supabase";

export type Article = {
  id: string;
  title: string;
  subheadline: string;
  category: string;
  categories?: string[];
  seo_title: string;
  seo_description: string;
  seo_keywords?: string;
  content: string;
  author_name: string;
  cover_image: string | null;
  views: number;
  published_at: string;
  updated_at: string;
};

// Generate a slug from a title
export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get the latest articles for the homepage
export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching latest articles:", error);
    return [];
  }

  return data as Article[];
}

// Get articles by category
export async function getArticlesByCategory(category: string, limit = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .ilike("category", category)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching articles for category ${category}:`, error);
    return [];
  }

  return data as Article[];
}

// Get single article by exact title match (using slug as an approximation for now)
// In a real app, it's better to store the slug directly in the DB. We'll find by title ilike.
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // Convert slug back to a rough title format to search, or fetch all and match
  // Since we don't have a 'slug' column in the articles table right now, 
  // we will fetch recent articles and find the one that matches the slug.
  // A better approach is to add a 'slug' column, but this works for our current schema.
  
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(100);

  if (error || !data) return null;

  const article = data.find(a => generateSlug(a.title) === slug);
  return (article as Article) || null;
}
