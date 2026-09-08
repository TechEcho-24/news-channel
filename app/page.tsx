import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Clock, ArrowRight } from "lucide-react";
import { getLatestArticles, getArticlesByCategory, generateSlug } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import MarketTrendsClient from "@/components/articles/MarketTrendsClient";

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

  // Sidebar Articles (Latest News) - strictly last 24 hours, max 7 items
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const sidebarArticles = latestArticles
    .filter(article => new Date(article.published_at) >= twentyFourHoursAgo)
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
      {/* SECTION 2 — HERO NEWS */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Lead Story */}
          <div className="lg:col-span-2">
            <Link href={`/${heroArticle.category.toLowerCase()}/${heroSlug}`} className="block relative aspect-[16/9] w-full bg-gray-200 mb-4 overflow-hidden group">
              {heroArticle.cover_image ? (
                <Image src={heroArticle.cover_image} alt={heroArticle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="absolute inset-0 bg-blue-100 flex items-center justify-center text-gray-500 group-hover:scale-105 transition-transform duration-500">
                  No Image Available
                </div>
              )}
            </Link>
            <div className="flex items-center space-x-3 mb-3">
              <Link href={`/${heroArticle.category.toLowerCase()}`} className="text-blue-600 font-bold text-xs capitalize tracking-wider hover:underline font-inter">
                {heroArticle.category}
              </Link>
              <span className="text-gray-500 flex items-center text-xs">
                <Clock size={12} className="mr-1" /> {formatDistanceToNow(new Date(heroArticle.published_at), { addSuffix: true })}
              </span>
            </div>
            <Link href={`/${heroArticle.category.toLowerCase()}/${heroSlug}`}>
              <h1 className="text-[32px] font-medium leading-tight mb-4 hover:text-blue-600 transition-colors font-poppins">
                {heroArticle.title}
              </h1>
            </Link>
            <p className="text-gray-600 text-lg mb-6 line-clamp-2">
              {heroArticle.subheadline}
            </p>
            <Link href={`/${heroArticle.category.toLowerCase()}/${heroSlug}`} className="inline-flex items-center bg-blue-600 text-white px-6 py-3 font-semibold text-sm hover:bg-blue-700 transition-colors">
              Read More <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          {/* Sidebar Area */}
          <div className="flex flex-col space-y-10">
            {/* Market Trend & Analytics */}
            <div className="flex flex-col space-y-6">
              <MarketTrendsClient />
              
              {/* Commodities (Static) */}
              <div>
                <h3 className="font-bold capitalize tracking-wider text-sm border-b-2 border-black pb-2 mb-4 font-inter">Commodities</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-3 rounded border border-amber-100 flex flex-col">
                    <span className="text-[10px] text-amber-700 font-semibold mb-1 tracking-wider font-inter">GOLD (24K, 10g)</span>
                    <span className="font-bold text-lg leading-none mb-1 text-amber-900">₹72,450</span>
                    <span className="text-gray-500 text-[10px] font-medium">Standard rate</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col">
                    <span className="text-[10px] text-slate-600 font-semibold mb-1 tracking-wider font-inter">SILVER (1kg)</span>
                    <span className="font-bold text-lg leading-none mb-1 text-slate-800">₹91,200</span>
                    <span className="text-gray-500 text-[10px] font-medium">Standard rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stories - Latest News */}
            <div>
              <h3 className="font-bold capitalize tracking-wider text-sm border-b-2 border-black pb-2 mb-6 font-inter">Latest News</h3>
              
              <div className="flex flex-col space-y-4">
                {sidebarArticles.length > 0 ? sidebarArticles.map((news: any, idx: number) => {
                  const slug = generateSlug(news.title);
                  return (
                    <div key={idx} className="group cursor-pointer border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/${news.category.toLowerCase()}`} className="text-blue-600 font-bold text-[10px] capitalize tracking-wider font-inter hover:underline">{news.category}</Link>
                        <span className="text-gray-400 text-[10px]">{formatDistanceToNow(new Date(news.published_at), { addSuffix: true })}</span>
                      </div>
                      <Link href={`/${news.category.toLowerCase()}/${slug}`}>
                        <h4 className="text-[15px] font-serif font-bold leading-snug group-hover:text-blue-600 transition-colors">
                          {news.title}
                        </h4>
                      </Link>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-gray-500 italic">No breaking news in the last 24 hours.</p>
                )}
              </div>
            </div>

            {/* Ad Space */}
            <div className="bg-gray-50 p-4 text-center border border-gray-200 mt-4">
              <span className="text-[10px] text-gray-400 capitalize tracking-widest block mb-2 font-inter">Advertisement</span>
              <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                Sidebar Banner (300x250)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — CATEGORY BLOCKS */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          
          {categoryBlocks.map((block, idx) => {
            if (block.articles.length === 0) return null; // Skip empty categories
            
            const layoutStyle = idx % 2;
            const featuredArticle = block.articles[0];
            const listArticles = block.articles.slice(1, 5);

            return (
            <div key={idx}>
              {/* Leaderboard Ad Placeholder after every 2 categories */}
              {idx > 0 && idx % 2 === 0 && (
                <div className="w-full mb-16 bg-gray-50 p-4 text-center border-y border-gray-200">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-2">Advertisement</span>
                  <div className="w-full max-w-[728px] h-[90px] bg-gray-200 mx-auto flex items-center justify-center text-gray-500 font-medium text-sm">
                    Leaderboard Ad (728x90)
                  </div>
                </div>
              )}

              <div className="mb-16 last:mb-0">
                <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-2">
                  <h2 className="text-2xl font-bold capitalize tracking-wider text-black font-inter">{block.name}</h2>
                  <Link href={`/${block.name.toLowerCase()}`} className="text-sm font-semibold flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                    View All {block.name} <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>

              {/* Layout 0: Large Left, List Right */}
              {layoutStyle === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 group cursor-pointer">
                    <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`} className="block aspect-[2/1] w-full bg-gray-100 mb-4 relative overflow-hidden">
                       {featuredArticle.cover_image ? (
                          <Image src={featuredArticle.cover_image} alt={featuredArticle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                            No Image
                          </div>
                       )}
                    </Link>
                    <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`}>
                      <h3 className="text-2xl font-serif font-bold leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                        {featuredArticle.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {featuredArticle.subheadline}
                    </p>
                    <div className="text-gray-500 text-xs flex items-center font-medium">
                      <Clock size={12} className="mr-1" /> {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-6">
                    {listArticles.map((item) => (
                      <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="flex space-x-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="aspect-square w-24 bg-gray-100 flex-shrink-0 relative overflow-hidden bg-gray-200">
                          {item.cover_image ? (
                             <Image src={item.cover_image} alt={item.title} fill className="object-cover" />
                          ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">Thumb</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-sm font-serif font-bold leading-snug group-hover:text-blue-600 transition-colors mb-2">
                            {item.title}
                          </h4>
                          <div className="text-gray-400 text-[10px] flex items-center">
                            <Clock size={10} className="mr-1" /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
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
                  <div className="flex flex-col space-y-6 order-2 lg:order-1">
                    {listArticles.map((item) => (
                      <Link key={item.id} href={`/${item.category.toLowerCase()}/${generateSlug(item.title)}`} className="flex space-x-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="aspect-square w-24 bg-gray-100 flex-shrink-0 relative overflow-hidden bg-gray-200">
                          {item.cover_image ? (
                             <Image src={item.cover_image} alt={item.title} fill className="object-cover" />
                          ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">Thumb</div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-sm font-serif font-bold leading-snug group-hover:text-blue-600 transition-colors mb-2">
                            {item.title}
                          </h4>
                          <div className="text-gray-400 text-[10px] flex items-center">
                            <Clock size={10} className="mr-1" /> {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="lg:col-span-2 group cursor-pointer order-1 lg:order-2">
                    <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`} className="block aspect-[2/1] w-full bg-gray-100 mb-4 relative overflow-hidden">
                       {featuredArticle.cover_image ? (
                          <Image src={featuredArticle.cover_image} alt={featuredArticle.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                            No Image
                          </div>
                       )}
                    </Link>
                    <Link href={`/${featuredArticle.category.toLowerCase()}/${generateSlug(featuredArticle.title)}`}>
                      <h3 className="text-2xl font-serif font-bold leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                        {featuredArticle.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {featuredArticle.subheadline}
                    </p>
                    <div className="text-gray-500 text-xs flex items-center font-medium">
                      <Clock size={12} className="mr-1" /> {formatDistanceToNow(new Date(featuredArticle.published_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          )})}

        </div>
      </section>

      {/* SECTION 8 — NEWSLETTER / SUBSCRIBE */}
      <section className="bg-[#111111] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Stay Ahead of the News</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Get important stories, breaking updates, and editor's picks delivered directly to you.
          </p>
          
          <form className="max-w-xl mx-auto bg-white p-1 flex">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 text-black px-4 py-3 outline-none"
              required
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 transition-colors">
              Subscribe
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
             <label className="flex items-center space-x-2 cursor-pointer">
               <input type="checkbox" defaultChecked className="accent-blue-600" />
               <span>Breaking News</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
               <input type="checkbox" defaultChecked className="accent-blue-600" />
               <span>Daily News Digest</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
               <input type="checkbox" className="accent-blue-600" />
               <span>Technology</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
               <input type="checkbox" className="accent-blue-600" />
               <span>Business</span>
             </label>
          </div>
        </div>
      </section>
    </div>
  );
}
