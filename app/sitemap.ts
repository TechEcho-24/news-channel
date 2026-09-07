import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theecho.in";

const staticCategories = [
  "latest", "india", "world", "business", "technology",
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
      .select("title, category, updated_at")
      .order("published_at", { ascending: false })
      .limit(1000);

    const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
      url: `${SITE_URL}/${article.category}/${generateSlug(article.title)}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
