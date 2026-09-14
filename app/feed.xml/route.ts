import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatnewsbulletin.com";
const SITE_NAME = "Bharat News Bulletin";
const SITE_DESCRIPTION = "Bharat News Bulletin (BNB) brings you breaking news, in-depth analysis, and stories from India and the world.";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from("articles")
      .select("title, subheadline, category, published_at, author_name")
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching articles for RSS feed:", error);
      return new Response("Error generating RSS feed", { status: 500 });
    }

    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${(articles || []).map((article) => {
  const url = `${SITE_URL}/${article.category}/${generateSlug(article.title)}`;
  const pubDate = new Date(article.published_at).toUTCString();
  
  // Escape XML special characters
  const escapeXml = (unsafe: string) => {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const title = escapeXml(article.title);
  const description = escapeXml(article.subheadline);
  const author = escapeXml(article.author_name || 'Bharat News Bulletin');
  const category = escapeXml(article.category);

  return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>contact@bharatnewsbulletin.com (${author})</author>
      <category>${category}</category>
    </item>`;
}).join('\n')}
  </channel>
</rss>`;

    return new Response(xmlData, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 's-maxage=0, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
