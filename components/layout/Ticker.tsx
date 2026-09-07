import Link from "next/link";
import LiveClock from "@/components/ui/LiveClock";

export default function Ticker() {
  // Mock latest breaking news
  const latestNews = [
    { id: 1, text: "Global markets rally as tech sector posts record earnings", link: "/business/global-markets-rally" },
    { id: 2, text: "New AI regulations proposed by European Commission", link: "/technology" },
    { id: 3, text: "Central Bank announces unexpected interest rate decision", link: "/economy" },
  ];

  if (!latestNews || latestNews.length === 0) return null;

  return (
    <div className="bg-[#111111] text-white text-xs font-semibold capitalize tracking-wider py-2 px-4 flex items-center justify-between font-inter">
      <div className="flex items-center flex-1 overflow-hidden">
        <div className="bg-[#DC2626] text-white px-2 py-0.5 mr-4 flex-shrink-0 z-10 shadow-[4px_0px_10px_rgba(17,17,17,1)]">
          BREAKING NEWS
        </div>
        
        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
            {latestNews.map((news) => (
              <Link key={news.id} href={news.link} className="mx-8 hover:text-[#3B82F6] hover:underline transition-colors cursor-pointer">
                • {news.text}
              </Link>
            ))}
            {/* Duplicate for seamless loop */}
            {latestNews.map((news) => (
              <Link key={`dup-${news.id}`} href={news.link} className="mx-8 hover:text-[#3B82F6] hover:underline transition-colors cursor-pointer">
                • {news.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Date & Time */}
      <div className="hidden md:block flex-shrink-0 ml-6 text-gray-400">
        <LiveClock />
      </div>
    </div>
  );
}
