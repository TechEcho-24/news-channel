import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatnewsbulletin.com";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const staticCategories = [
  "latest", "india", "world", "business", "technology", "health",
  "startups", "markets", "automobile", "entertainment",
  "sports", "lifestyle", "reviews",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...staticCategories.map((cat) => ({
      url: `${SITE_URL}/${cat}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];

  // Dynamic article pages
  try {
    const { data: articles } = await supabase
      .from("articles")
      .select("title, category, updated_at, published_at")
      .order("published_at", { ascending: false })
      .limit(1000);

    const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
      url: `${SITE_URL}/${encodeURIComponent(article.category.toLowerCase())}/${generateSlug(article.title)}`,
      lastModified: new Date(article.updated_at || article.published_at || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...articlePages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticPages;
  }
}
