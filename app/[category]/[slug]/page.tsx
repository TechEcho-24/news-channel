import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Link as LinkIcon, Share2, Globe, Rss } from "lucide-react";
import type { Metadata } from "next";
import { getArticleBySlug } from "@/lib/api";
import ArticleActionsClient from "@/components/articles/ArticleActionsClient";
import AdSlot from "@/components/ads/AdSlot";

const SITE_NAME = "Bharat News Bulletin";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bnbnews.in";

export async function generateMetadata(
  { params }: { params: Promise<{ category: string; slug: string }> }
): Promise<Metadata> {
  const { slug, category } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const articleUrl = `${SITE_URL}/${category}/${slug}`;

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.subheadline || "",
    keywords: Array.from(new Set([
      article.category,
      ...(article.categories || []),
      ...(article.seo_keywords ? article.seo_keywords.split(",").map(k => k.trim()) : []),
      "news", "india", SITE_NAME
    ])).filter(Boolean),
    authors: [{ name: article.author_name || SITE_NAME }],
    alternates: { canonical: articleUrl },
    openGraph: {
      type: "article",
      url: articleUrl,
      title: article.seo_title || article.title,
      description: article.seo_description || article.subheadline || "",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: [article.author_name || SITE_NAME],
      siteName: SITE_NAME,
      images: article.cover_image
        ? [{ url: article.cover_image, width: 1200, height: 630, alt: article.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo_title || article.title,
      description: article.seo_description || article.subheadline || "",
      images: article.cover_image ? [article.cover_image] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const resolvedParams = await params;

  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const publishedDate = article.published_at ? new Date(article.published_at) : new Date();

  // Combine primary category and extra categories
  const allCategories = Array.from(new Set([
    article.category,
    ...(article.categories || [])
  ])).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.subheadline || article.seo_description || "",
    "image": article.cover_image ? [article.cover_image] : [],
    "datePublished": article.published_at,
    "dateModified": article.updated_at || article.published_at,
    "author": {
      "@type": "Person",
      "name": article.author_name || SITE_NAME
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "articleSection": article.category,
    "keywords": allCategories.join(", ")
  };

  return (
    <article className="bg-white min-h-screen">
      {/* Schema.org JSON-LD for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Ad */}
      <div className="container mx-auto px-4 py-6 max-w-5xl flex justify-center border-b border-gray-100">
        <AdSlot slot="leaderboard" />
      </div>

      {/* Article Header */}
      <div className="container mx-auto px-4 pt-8 lg:pt-12 max-w-5xl text-left">
        <div className="mb-4">
          <Link href={`/${article.category}`} className="text-blue-600 font-bold text-sm uppercase tracking-wider hover:underline">
            {article.category}
          </Link>
        </div>
        <h1 className="text-[32px] font-bold leading-tight mb-6">
          {article.title}
        </h1>
      </div>

      {/* Hero Image */}
      {article.cover_image && (
        <div className="container mx-auto px-4 max-w-5xl mb-12">
          <div className="relative aspect-[21/9] w-full bg-gray-100 overflow-hidden">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content & Sidebar Grid */}
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Main Content */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            {article.subheadline && (
              <p className="text-xl font-semibold italic text-gray-700 mb-8 leading-relaxed border-l-4 border-blue-600 pl-4">
                {article.subheadline}
              </p>
            )}

            <div 
              className="prose prose-lg prose-blue max-w-none mb-12 [&_h3]:font-bold [&_h3]:text-[22px] [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-gray-900 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-600 [&_blockquote]:bg-blue-50/70 [&_blockquote]:py-3.5 [&_blockquote]:px-5 [&_blockquote]:rounded-r-md [&_blockquote]:font-medium [&_blockquote]:text-gray-900 [&_blockquote]:my-8 [&_blockquote_p]:m-0 [&_p]:mb-6 [&_p]:text-gray-800 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />

            {/* Topic Category Tags Badges for SEO & Navigation */}
            {allCategories.length > 0 && (
              <div className="my-8 pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2.5">Related Topics:</span>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/${cat.toLowerCase().trim()}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-colors"
                    >
                      #{cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author Meta at Bottom */}
            <div className="border-t border-gray-100 py-6 mb-8 text-left">
              <div className="font-bold text-sm text-gray-900">Author: {article.author_name || "Bharat News Bulletin Staff"}</div>
              <div className="text-xs text-gray-500 mt-1">
                Published on {format(publishedDate, "MMMM d, yyyy")}
              </div>
            </div>

            {/* In-Article Ad */}
            <div className="my-10 text-center">
              <AdSlot slot="in_article" />
            </div>

            {/* Impressions & Comments Toggle */}
            <ArticleActionsClient key={article.id} articleId={article.id} initialImpressions={article.impressions || 0} />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[300px] flex-shrink-0 flex flex-col space-y-10">
            {/* Sidebar Ad */}
            <AdSlot slot="sidebar" />

            {/* More from this category */}
            <div className="border border-gray-200 p-6 bg-[#FAFAFA]">
              <h3 className="font-bold uppercase tracking-wider text-sm border-b-2 border-black pb-2 mb-6">
                More from {article.category}
              </h3>
              <p className="text-sm text-gray-400">Related articles coming soon.</p>
            </div>

            {/* Sidebar Sticky Ad */}
            <div className="sticky top-24">
              <AdSlot slot="half_page" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
