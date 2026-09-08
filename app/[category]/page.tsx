import Link from "next/link";
import Image from "next/image";
import { Clock, ChevronRight } from "lucide-react";
import { getLatestArticles, getArticlesByCategory, generateSlug } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

const SITE_NAME = "The Echo";

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
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    articles = allLatest.filter((a: any) => new Date(a.published_at) >= twentyFourHoursAgo);
  } else {
    articles = await getArticlesByCategory(categoryStr, 50);
  }

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const listArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center space-x-2 text-sm font-semibold mb-8 border-b border-gray-200 pb-4">
          <Link href="/" className="text-gray-500 hover:text-black transition-colors uppercase tracking-wider font-inter">Home</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-red-600 uppercase tracking-wider font-inter">{categoryName}</span>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No articles found for this category.
          </div>
        ) : (
          <>
            {/* Featured Article for Category */}
            {featuredArticle && (
              <div className="mb-12">
                <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`} className="group block">
                  <div className="relative aspect-[21/9] w-full bg-gray-200 mb-4 overflow-hidden">
                     {featuredArticle.cover_image ? (
                        <Image src={featuredArticle.cover_image} alt={featuredArticle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                          No Image
                        </div>
                     )}
                  </div>
                  <h2 className="text-[32px] font-bold leading-tight mb-3 group-hover:text-blue-600 transition-colors font-poppins">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-3 line-clamp-2 max-w-4xl">
                    {featuredArticle.subheadline}
                  </p>
                  <div className="text-gray-500 text-xs flex items-center font-medium">
                    <Clock size={12} className="mr-1" /> {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}
                  </div>
                </Link>
              </div>
            )}

            {/* Latest Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listArticles.map((item: any) => (
                <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="group block">
                  <div className="aspect-[16/9] w-full bg-gray-200 mb-4 relative overflow-hidden">
                     {item.cover_image ? (
                        <Image src={item.cover_image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                          No Image
                        </div>
                     )}
                  </div>
                  <h3 className="text-[18px] font-bold leading-snug mb-2 group-hover:text-blue-600 transition-colors font-serif">
                    {item.title}
                  </h3>
                  <div className="text-gray-500 text-[11px] flex items-center font-medium">
                    <Clock size={12} className="mr-1" /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
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
