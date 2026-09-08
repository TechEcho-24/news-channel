import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Clock, ArrowRight, BarChart2 } from "lucide-react";
import { getLatestArticles, getArticlesByCategory, generateSlug } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import MarketTrendsClient from "@/components/articles/MarketTrendsClient";
import NewsletterClient from "@/components/articles/NewsletterClient";
import AdSlot from "@/components/ads/AdSlot";

export const revalidate = 0;

export default async function Home() {
  // Fetch real articles from Supabase
  const latestArticles = await getLatestArticles(20);
  
  if (latestArticles.length === 0) {
    return (
      <div className="bg-[#FAFAFA] min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Welcome to The Echo</h1>
        <p className="text-gray-500 mb-8 max-w-md text-center">There are no articles published yet. Head over to the admin panel to publish your first news story.</p>
        <Link href="/admin/articles/new" className="bg-blue-600 text-white px-6 py-3 font-semibold text-sm hover:bg-blue-700 transition-colors">
          Publish First Article
        </Link>
      </div>
    );
  }

  // Hero Article
  const heroArticle = latestArticles[0];
  const heroSlug = generateSlug(heroArticle.title);

  // Sidebar Articles (Latest News) - strictly last 12 hours, max 7 items
  const twelveHoursAgo = new Date();
  twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

  const sidebarArticles = latestArticles
    .filter(article => new Date(article.published_at) >= twelveHoursAgo)
    .slice(0, 7);

  // Fetch articles for specific categories for the blocks
  const categoryNames = ["business", "technology", "india", "world"];
  const categoryBlocks = await Promise.all(
    categoryNames.map(async (cat) => {
      const articles = await getArticlesByCategory(cat, 5);
      return { name: cat, articles };
    })
  );

  return (
    <div className="bg-[#FAFAFA]">
      {/* HOMEPAGE HERO TOP AD BANNER */}
      <div className="container mx-auto px-4 pt-6">
        <AdSlot slot="homepage_hero" />
      </div>

      {/* SECTION — HERO NEWS */}
      <section className="container mx-auto px-4 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Lead Story */}
          <div className="lg:col-span-2">
            <Link href={`/${heroArticle.category.toLowerCase()}/${heroSlug}`} className="block relative aspect-[16/9] w-full bg-gray-200 mb-5 overflow-hidden group rounded-sm">
              {heroArticle.cover_image ? (
                <Image src={heroArticle.cover_image} alt={heroArticle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="absolute inset-0 bg-blue-100 flex items-center justify-center text-gray-500 group-hover:scale-105 transition-transform duration-500">
                  No Image Available
                </div>
              )}
            </Link>
            <div className="flex items-center space-x-3 mb-3">
              <Link href={`/${heroArticle.category.toLowerCase()}`} className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-2 py-0.5 hover:bg-blue-700 transition-colors font-inter">
                {heroArticle.category}
              </Link>
              <span className="text-gray-400 flex items-center text-xs gap-1">
                <Clock size={12} />
                {formatDistanceToNow(new Date(heroArticle.published_at), { addSuffix: true })}
                <span className="mx-1">•</span>
                <BarChart2 size={12} />
                {heroArticle.impressions || 0} views
              </span>
            </div>
            <Link href={`/${heroArticle.category.toLowerCase()}/${heroSlug}`}>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 hover:text-blue-600 transition-colors font-poppins tracking-tight">
                {heroArticle.title}
              </h1>
            </Link>
            <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-2xl">
              {heroArticle.subheadline}
            </p>
            <Link href={`/${heroArticle.category.toLowerCase()}/${heroSlug}`} className="inline-flex items-center bg-blue-600 text-white px-6 py-3 font-semibold text-sm hover:bg-blue-700 transition-colors rounded-sm">
              Read Full Story <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          {/* Sidebar Area */}
          <div className="flex flex-col space-y-5">
            {/* Market Trend & Analytics */}
            <div className="flex flex-col space-y-4">
              <MarketTrendsClient />
              
              {/* Commodities (Static) */}
              <div>
                <h3 className="font-black uppercase tracking-widest text-xs border-b-2 border-black pb-2 mb-3 font-inter text-gray-900">Commodities</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 p-3 rounded-sm border border-amber-100 flex flex-col">
                    <span className="text-xs text-amber-700 font-bold mb-1 tracking-wider font-inter uppercase">Gold (24K)</span>
                    <span className="font-black text-xl leading-none mb-1 text-amber-900">₹72,450</span>
                    <span className="text-gray-500 text-xs font-medium">per 10g</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 flex flex-col">
                    <span className="text-xs text-slate-600 font-bold mb-1 tracking-wider font-inter uppercase">Silver</span>
                    <span className="font-black text-xl leading-none mb-1 text-slate-800">₹91,200</span>
                    <span className="text-gray-500 text-xs font-medium">per kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stories - Latest News */}
            <div>
              <h3 className="font-black uppercase tracking-widest text-xs border-b-2 border-black pb-2 mb-3 font-inter text-gray-900">Latest News</h3>
              
              <div className="flex flex-col divide-y divide-gray-100">
                {sidebarArticles.length > 0 ? sidebarArticles.map((news: any, idx: number) => {
                  const slug = generateSlug(news.title);
                  return (
                    <div key={idx} className="py-2.5 first:pt-0">
                      <div className="flex justify-between items-center mb-1">
                        <Link href={`/${news.category.toLowerCase()}`} className="text-blue-600 font-bold text-[11px] capitalize tracking-wider font-inter hover:underline">{news.category}</Link>
                        <div className="text-gray-400 text-[11px] flex items-center gap-1">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(news.published_at), { addSuffix: true })}
                        </div>
                      </div>
                      <Link href={`/${news.category.toLowerCase()}/${slug}`}>
                        <h4 className="text-[15px] font-bold leading-snug hover:text-blue-600 transition-colors text-gray-900">
                          {news.title}
                        </h4>
                      </Link>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-gray-400 italic py-3">No breaking news in the last 12 hours.</p>
                )}
              </div>
            </div>

            {/* Sidebar Ad */}
            <AdSlot slot="sidebar" className="my-2" />
          </div>
        </div>
      </section>

      {/* SECTION — CATEGORY BLOCKS */}
      <section className="bg-white py-14 border-t border-gray-100">
        <div className="container mx-auto px-4">
          
          {(() => {
            const visibleBlocks = categoryBlocks.filter(b => b.articles.length > 0);
            return visibleBlocks.map((block, idx) => {
              const layoutStyle = idx % 2;
              const featuredArticle = block.articles[0];
              const listArticles = block.articles.slice(1, 5);

              return (
                <div key={idx}>
                  {idx > 0 && (
                    <div className="w-full py-6 my-6 border-y border-gray-100 flex justify-center">
                      <AdSlot slot="leaderboard" />
                    </div>
                  )}

              <div className="mb-16 last:mb-0 pt-2">
                <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2">
                  <h2 className="text-lg font-black capitalize tracking-widest text-black font-inter uppercase">{block.name}</h2>
                  <Link href={`/${block.name.toLowerCase()}`} className="text-xs font-bold flex items-center text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-wider">
                    More <ArrowRight size={13} className="ml-1" />
                  </Link>
                </div>

              {/* Layout 0: Large Left, List Right */}
              {layoutStyle === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 group">
                    <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`} className="block aspect-[16/9] w-full bg-gray-100 mb-4 relative overflow-hidden rounded-sm">
                       {featuredArticle.cover_image ? (
                          <Image src={featuredArticle.cover_image} alt={featuredArticle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">No Image</div>
                       )}
                    </Link>
                    <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`}>
                      <h3 className="text-xl font-bold leading-snug mb-2 group-hover:text-blue-600 transition-colors tracking-tight text-gray-900">
                        {featuredArticle.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
                      {featuredArticle.subheadline}
                    </p>
                    <div className="text-gray-400 text-xs flex items-center gap-1.5">
                      <Clock size={11} /> {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}
                      <span>•</span>
                      <BarChart2 size={11} /> {featuredArticle.impressions || 0}
                    </div>
                  </div>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {listArticles.map((item) => (
                      <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="flex space-x-3 group py-4 first:pt-0 last:pb-0">
                        <div className="w-20 h-16 bg-gray-100 flex-shrink-0 relative overflow-hidden rounded-sm">
                          {item.cover_image ? (
                             <Image src={item.cover_image} alt={item.title} fill className="object-cover" />
                          ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">No img</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[13px] font-bold leading-snug group-hover:text-blue-600 transition-colors mb-1.5 text-gray-900">
                            {item.title}
                          </h4>
                          <div className="text-gray-400 text-[11px] flex items-center gap-1">
                            <Clock size={10} /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Layout 1: List Left, Large Right */}
              {layoutStyle === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="flex flex-col divide-y divide-gray-100 order-2 lg:order-1">
                    {listArticles.map((item) => (
                      <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="flex space-x-3 group py-4 first:pt-0 last:pb-0">
                        <div className="w-20 h-16 bg-gray-100 flex-shrink-0 relative overflow-hidden rounded-sm">
                          {item.cover_image ? (
                             <Image src={item.cover_image} alt={item.title} fill className="object-cover" />
                          ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">No img</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[13px] font-bold leading-snug group-hover:text-blue-600 transition-colors mb-1.5 text-gray-900">
                            {item.title}
                          </h4>
                          <div className="text-gray-400 text-[11px] flex items-center gap-1">
                            <Clock size={10} /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="lg:col-span-2 group order-1 lg:order-2">
                    <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`} className="block aspect-[16/9] w-full bg-gray-100 mb-4 relative overflow-hidden rounded-sm">
                       {featuredArticle.cover_image ? (
                          <Image src={featuredArticle.cover_image} alt={featuredArticle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">No Image</div>
                       )}
                    </Link>
                    <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`}>
                      <h3 className="text-xl font-bold leading-snug mb-2 group-hover:text-blue-600 transition-colors tracking-tight text-gray-900">
                        {featuredArticle.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
                      {featuredArticle.subheadline}
                    </p>
                    <div className="text-gray-400 text-xs flex items-center gap-1.5">
                      <Clock size={11} /> {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}
                      <span>•</span>
                      <BarChart2 size={11} /> {featuredArticle.impressions || 0}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          );
        });
      })()}
        </div>
      </section>

      {/* SECTION 8 — NEWSLETTER / SUBSCRIBE */}
      <section className="bg-[#111111] text-white py-16">
        <NewsletterClient />
      </section>
    </div>
  );
}
