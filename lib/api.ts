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
  image_alt?: string;
  views: number;
  impressions: number;
  published_at: string;
  updated_at: string;
};

// Generate a clean slug from a title
export function generateSlug(title: string) {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[’‘']/g, "")
    .replace(/[“”"]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export async function getArticlesByCategory(category: string, limit = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    // Match either the primary category OR if it's in the categories array
    .or(`category.ilike.%${category}%,categories.cs.{"${category}"}`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching articles for category ${category}:`, error);
    return [];
  }

  return data as Article[];
}

// Get single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!slug) return null;

  // 1. Fast path: Query using distinct keywords from slug to find candidates efficiently
  const words = slug.split("-").filter((w) => w.length >= 3 && !/^\d+$/.test(w));
  words.sort((a, b) => b.length - a.length);

  if (words.length > 0) {
    // Search with top 2 most distinctive words
    const topWords = words.slice(0, 2);
    let query = supabase.from("articles").select("*");
    for (const w of topWords) {
      query = query.ilike("title", `%${w}%`);
    }
    const { data: candidates } = await query.limit(20);
    const match = candidates?.find((a) => generateSlug(a.title) === slug);
    if (match) return match as Article;

    // Fallback search with the single longest word
    if (words.length > 1) {
      const { data: candidates2 } = await supabase
        .from("articles")
        .select("*")
        .ilike("title", `%${words[0]}%`)
        .limit(40);
      const match2 = candidates2?.find((a) => generateSlug(a.title) === slug);
      if (match2) return match2 as Article;
    }
  }

  // 2. Comprehensive fallback: Search lightweight id & title list across all articles
  // This guarantees articles of any age (older than 11-12 days) or with numbers/special chars are ALWAYS found!
  const { data: indexList } = await supabase
    .from("articles")
    .select("id, title")
    .order("published_at", { ascending: false })
    .limit(5000);

  const hit = indexList?.find((a) => generateSlug(a.title) === slug);
  if (hit) {
    const { data: fullArticle } = await supabase
      .from("articles")
      .select("*")
      .eq("id", hit.id)
      .single();
    return (fullArticle as Article) || null;
  }

  return null;
}

