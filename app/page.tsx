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
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Welcome to Bharat News Bulletin (BNB)</h1>
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
  const categoryNames = ["business", "technology", "economy", "india", "world", "entertainment", "startups", "lifestyle"];
  const categoryBlocks = await Promise.all(
    categoryNames.map(async (cat) => {
      const limit = cat === "economy" ? 4 : 5;
      const articles = await getArticlesByCategory(cat, limit);
      return { name: cat, articles };
    })
  );

  // New row for Health, Markets, Sports (max 3 each)
  const hmsCategories = ["health", "markets", "sports"];
  const hmsBlocks = await Promise.all(
    hmsCategories.map(async (cat) => {
      const articles = await getArticlesByCategory(cat, 3);
      return { name: cat, articles };
    })
  );

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatnewsbulletin.com";
  const SITE_NAME = "Bharat News Bulletin";
  
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL
  };

  return (
    <div className="bg-[#FAFAFA]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* HOMEPAGE HERO TOP AD BANNER */}
      <div className="container mx-auto px-4 pt-6">
        <AdSlot slot="homepage_hero" />
      </div>

      {/* SECTION — HERO NEWS */}
      <section className="container mx-auto px-4 pt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Lead Story */}
          <div className="lg:col-span-2">
            <Link href={`/${heroArticle.category.toLowerCase()}/${heroSlug}`} className="block relative aspect-[16/9] w-full bg-gray-200 mb-5 overflow-hidden group rounded-sm max-h-[500px] lg:max-h-[600px]">
              {heroArticle.cover_image ? (
                <Image src={heroArticle.cover_image} alt={heroArticle.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
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
            <div>
              <MarketTrendsClient />
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
                    <div className="w-full py-8 my-8 border-y border-gray-200/80 flex justify-center bg-gray-50/40 rounded-lg">
                      <AdSlot slot="category_banner" />
                    </div>
                  )}

              <div className="mb-16 last:mb-0 pt-2">
                <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2">
                  <h2 className="text-lg font-black capitalize tracking-widest text-black font-inter uppercase">{block.name}</h2>
                  <Link href={`/${block.name.toLowerCase()}`} className="text-xs font-bold flex items-center text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-wider">
                    More <ArrowRight size={13} className="ml-1" />
                  </Link>
                </div>

              {/* Layout 4-Card Grid for Economy */}
              {block.name === "economy" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {block.articles.slice(0, 4).map((item) => (
                    <div key={item.id} className="group bg-white border border-gray-200/80 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <Link href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="block aspect-[16/10] w-full relative bg-gray-100 overflow-hidden">
                          {item.cover_image ? (
                            <Image src={item.cover_image} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={75} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">No Image</div>
                          )}
                        </Link>
                        <div className="p-4">
                          <div className="text-gray-400 text-[11px] flex items-center gap-1.5 font-inter mb-2">
                            <Clock size={11} /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                          </div>
                          <Link href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`}>
                            <h4 className="text-base font-bold leading-snug group-hover:text-blue-600 transition-colors mb-2 text-gray-900 line-clamp-2">
                              {item.title}
                            </h4>
                          </Link>
                          {item.subheadline && (
                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                              {item.subheadline}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="px-4 pb-3 pt-2 text-gray-400 text-[11px] flex items-center justify-between font-inter border-t border-gray-100 bg-gray-50/50">
                        <span className="flex items-center gap-1"><BarChart2 size={11} /> {item.impressions || 0} views</span>
                        <span className="text-blue-600 font-semibold group-hover:underline text-[11px]">Read Story &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Layout 0: Large Left, List Right */}
                  {layoutStyle === 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                      <div className="lg:col-span-2 group">
                        <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`} className="block aspect-[16/9] w-full bg-gray-100 mb-4 relative overflow-hidden rounded-md shadow-sm">
                           {featuredArticle.cover_image ? (
                              <Image src={featuredArticle.cover_image} alt={featuredArticle.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={75} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                           ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">No Image</div>
                           )}
                        </Link>
                        <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`}>
                          <h3 className="text-2xl font-bold leading-snug mb-2 group-hover:text-blue-600 transition-colors tracking-tight text-gray-900 font-poppins">
                            {featuredArticle.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
                          {featuredArticle.subheadline}
                        </p>
                        <div className="text-gray-400 text-xs flex items-center gap-2 font-inter">
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><BarChart2 size={12} /> {featuredArticle.impressions || 0} views</span>
                        </div>
                      </div>
                      <div className="flex flex-col divide-y divide-gray-100">
                        {listArticles.map((item) => (
                          <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="flex space-x-3.5 group py-4 first:pt-0 last:pb-0 items-start">
                            <div className="w-24 h-20 sm:w-28 sm:h-20 bg-gray-100 flex-shrink-0 relative overflow-hidden rounded-md shadow-xs">
                              {item.cover_image ? (
                                 <Image src={item.cover_image} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={75} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                 <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">No img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm md:text-[15px] font-bold leading-snug group-hover:text-blue-600 transition-colors mb-1 text-gray-900 line-clamp-2">
                                {item.title}
                              </h4>
                              {item.subheadline && (
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-1.5">
                                  {item.subheadline}
                                </p>
                              )}
                              <div className="text-gray-400 text-[11px] flex items-center gap-1.5 font-inter">
                                <span className="flex items-center gap-1"><Clock size={10} /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><BarChart2 size={10} /> {item.impressions || 0}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layout 1: List Left, Large Right */}
                  {layoutStyle === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                      <div className="flex flex-col divide-y divide-gray-100 order-2 lg:order-1">
                        {listArticles.map((item) => (
                          <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="flex space-x-3.5 group py-4 first:pt-0 last:pb-0 items-start">
                            <div className="w-24 h-20 sm:w-28 sm:h-20 bg-gray-100 flex-shrink-0 relative overflow-hidden rounded-md shadow-xs">
                              {item.cover_image ? (
                                 <Image src={item.cover_image} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={75} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                 <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">No img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm md:text-[15px] font-bold leading-snug group-hover:text-blue-600 transition-colors mb-1 text-gray-900 line-clamp-2">
                                {item.title}
                              </h4>
                              {item.subheadline && (
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-1.5">
                                  {item.subheadline}
                                </p>
                              )}
                              <div className="text-gray-400 text-[11px] flex items-center gap-1.5 font-inter">
                                <span className="flex items-center gap-1"><Clock size={10} /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><BarChart2 size={10} /> {item.impressions || 0}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="lg:col-span-2 group order-1 lg:order-2">
                        <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`} className="block aspect-[16/9] w-full bg-gray-100 mb-4 relative overflow-hidden rounded-md shadow-sm">
                           {featuredArticle.cover_image ? (
                              <Image src={featuredArticle.cover_image} alt={featuredArticle.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={75} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                           ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200">No Image</div>
                           )}
                        </Link>
                        <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`}>
                          <h3 className="text-2xl font-bold leading-snug mb-2 group-hover:text-blue-600 transition-colors tracking-tight text-gray-900 font-poppins">
                            {featuredArticle.title}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
                          {featuredArticle.subheadline}
                        </p>
                        <div className="text-gray-400 text-xs flex items-center gap-2 font-inter">
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><BarChart2 size={12} /> {featuredArticle.impressions || 0} views</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              </div>
            </div>
          );
        });
      })()}
        </div>
      </section>

      {/* SECTION — HEALTH / MARKETS / SPORTS ROW */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hmsBlocks.map((block) => (
              <div key={block.name} className="space-y-4">
                <h2 className="text-lg font-bold capitalize text-gray-900 font-inter">{block.name}</h2>
                <div className="grid gap-4">
                  {block.articles.map((item) => (
                    <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="block group">
                      <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden rounded-md shadow-sm mb-2">
                        {item.cover_image ? (
                          <Image src={item.cover_image} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={75} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">No Image</div>
                        )}
                      </div>
                      <h4 className="text-base font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      {item.subheadline && (
                        <p className="text-sm text-gray-500 line-clamp-2">{item.subheadline}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — NEWSLETTER / SUBSCRIBE */}
      <section className="bg-[#111111] text-white py-16">
        <NewsletterClient />
      </section>
    </div>
  );
}
