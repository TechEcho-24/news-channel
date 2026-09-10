import Link from "next/link";
import LiveClock from "@/components/ui/LiveClock";
import { getLatestArticles, generateSlug } from "@/lib/api";

export default async function Ticker() {
  const articles = await getLatestArticles(10);

  const latestNews = articles.map((article) => ({
    id: article.id,
    text: article.title,
    link: `/${article.category.toLowerCase()}/${generateSlug(article.title)}`,
  }));

  if (!latestNews || latestNews.length === 0) return null;

  return (
    <div className="bg-[#111111] text-white text-xs font-semibold tracking-wider flex items-center justify-between font-inter border-b border-gray-800 pr-4">
      <div className="flex items-center flex-1 ">
        <span className="bg-[#DC2626] text-white font-black px-4 py-2 text-[10px] uppercase tracking-widest flex-shrink-0 z-10 flex items-center relative mr-4">
          BREAKING NEWS
        </span>

        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="flex whitespace-nowrap animate-[marquee_50s_linear_infinite] hover:[animation-play-state:paused]">
            {latestNews.map((news) => (
              <Link key={news.id} href={news.link} className="mx-8 hover:text-[#3B82F6] hover:underline transition-colors cursor-pointer flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                <span>{news.text}</span>
              </Link>
            ))}
            {/* Duplicate for seamless continuous loop */}
            {latestNews.map((news) => (
              <Link key={`dup-${news.id}`} href={news.link} aria-hidden="true" tabIndex={-1} rel="nofollow" className="mx-8 hover:text-[#3B82F6] hover:underline transition-colors cursor-pointer flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                <span>{news.text}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="hidden md:block flex-shrink-0 ml-6 text-gray-400 text-[11px]">
        <LiveClock />
      </div>
    </div>
  );
}
