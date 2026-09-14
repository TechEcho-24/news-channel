import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatnewsbulletin.com";
const SITE_NAME = "Bharat News Bulletin";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Google News only allows articles published in the last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: articles, error } = await supabase
      .from("articles")
      .select("title, category, published_at")
      .gte("published_at", fortyEightHoursAgo)
      .order("published_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Error fetching articles for news sitemap:", error);
      return new Response("Error generating news sitemap", { status: 500 });
    }

    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${(articles || []).map((article) => {
  const url = `${SITE_URL}/${article.category}/${generateSlug(article.title)}`;
  const pubDate = new Date(article.published_at).toISOString();
  // Escape XML special characters in title
  const title = article.title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
}).join('\n')}
</urlset>`;

    return new Response(xmlData, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
        'Cache-Control': 's-maxage=0, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error("Error generating news sitemap:", error);
    return new Response("Error generating news sitemap", { status: 500 });
  }
}
