import Link from "next/link";
import Image from "next/image";
import { Clock, ChevronRight, BarChart2 } from "lucide-react";
import { getLatestArticles, getArticlesByCategory, generateSlug } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

const SITE_NAME = "Bharat News Bulletin (BNB)";

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params;
  const name = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${name} News`,
    description: `Latest ${name} news, stories, and analysis from ${SITE_NAME}. Stay updated with breaking ${name.toLowerCase()} headlines.`,
    openGraph: {
      title: `${name} News | ${SITE_NAME}`,
      description: `Latest ${name} news and analysis.`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const categoryStr = resolvedParams.category || "";
  const categoryName = categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1);

  let articles = [];
  if (categoryStr.toLowerCase() === 'latest') {
    const allLatest = await getLatestArticles(50);
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
    articles = allLatest.filter((a: any) => new Date(a.published_at) >= twelveHoursAgo);
  } else {
    articles = await getArticlesByCategory(categoryStr, 50);
  }

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const listArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center space-x-2 text-sm font-medium mb-8 border-b border-gray-200 pb-4">
          <Link href="/" className="text-gray-400 hover:text-black transition-colors font-inter">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-red-600 font-bold uppercase tracking-widest text-xs font-inter">{categoryName}</span>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No articles found for this category.</p>
          </div>
        ) : (
          <>
            {/* Featured Article for Category */}
            {featuredArticle && (
              <div className="mb-12">
                <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`} className="group block">
                  <div className="relative aspect-[21/9] w-full bg-gray-200 mb-5 overflow-hidden rounded-md shadow-xs">
                     {featuredArticle.cover_image ? (
                        <Image src={featuredArticle.cover_image} alt={featuredArticle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                          No Image
                        </div>
                     )}
                  </div>
                  <div className="flex items-center gap-3 mb-3 font-inter">
                    <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs">{featuredArticle.category}</span>
                    <span className="text-gray-400 text-xs flex items-center gap-1.5">
                      <span className="flex items-center gap-1"><Clock size={12} /> {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}</span>
                      <span className="mx-1">•</span>
                      <span className="flex items-center gap-1"><BarChart2 size={12} /> {featuredArticle.impressions || 0} views</span>
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-3 group-hover:text-blue-600 transition-colors font-poppins tracking-tight max-w-4xl text-gray-900">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-base text-gray-600 mb-4 leading-relaxed line-clamp-2 max-w-3xl">
                    {featuredArticle.subheadline}
                  </p>
                </Link>
              </div>
            )}

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listArticles.map((item: any) => (
                <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="group flex flex-col">
                  <div className="aspect-[16/9] w-full bg-gray-200 mb-3.5 relative overflow-hidden rounded-md shadow-xs">
                     {item.cover_image ? (
                        <Image src={item.cover_image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">No Image</div>
                     )}
                  </div>
                  <h3 className="text-base md:text-lg font-bold leading-snug mb-1.5 group-hover:text-blue-600 transition-colors text-gray-900 tracking-tight font-poppins line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed flex-1">{item.subheadline}</p>
                  <div className="text-gray-400 text-[11px] flex items-center gap-1.5 font-inter mt-auto pt-1">
                    <span className="flex items-center gap-1"><Clock size={11} /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><BarChart2 size={11} /> {item.impressions || 0} views</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
