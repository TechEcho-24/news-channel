import Link from "next/link";
import { getActiveAd, AdSlotType } from "@/lib/ads";

const SLOT_SIZES: Record<AdSlotType, { label: string; className: string }> = {
  leaderboard:  { label: "728×90",  className: "w-full max-w-[728px] h-[90px]" },
  sidebar:      { label: "300×250", className: "w-full aspect-[6/5]" },
  in_article:   { label: "300×250", className: "w-full max-w-[300px] aspect-[6/5] mx-auto" },
  homepage_hero:{ label: "970×250", className: "w-full h-[120px] md:h-[200px]" },
  footer:       { label: "728×90",  className: "w-full max-w-[728px] h-[90px]" },
  nav_top:      { label: "970×90",  className: "w-full h-[60px] md:h-[90px]" },
};

interface AdSlotProps {
  slot: AdSlotType;
  className?: string;
}

export default async function AdSlot({ slot, className = "" }: AdSlotProps) {
  // Check if Google AdSense is enabled
  const useAdSense = process.env.NEXT_PUBLIC_USE_ADSENSE === "true";
  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  // If AdSense is configured, render AdSense script slot
  if (useAdSense && adSenseId) {
    return (
      <div className={`text-center ${className}`}>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Advertisement</span>
        {/* AdSense slot — replace data-ad-slot with your actual slot ID */}
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adSenseId}
          data-ad-slot="AUTO"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Otherwise, try fetching a direct (local vendor) ad
  const ad = await getActiveAd(slot);
  const sizes = SLOT_SIZES[slot] || SLOT_SIZES.leaderboard;

  if (!ad) {
    // No ad configured — show nothing (clean, no grey boxes)
    return null;
  }

  const href = ad.link_url.startsWith("http://") || ad.link_url.startsWith("https://")
    ? ad.link_url
    : `https://${ad.link_url}`;

  return (
    <div className={`text-center ${className}`}>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1 font-inter">Advertisement</span>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`group relative inline-block overflow-hidden rounded-sm border border-gray-200 shadow-sm ${sizes.className}`}
        title={ad.title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Optional Action Button Overlay */}
        {ad.cta_text && (
          <span className="absolute bottom-2.5 right-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-md group-hover:bg-blue-800 transition-colors flex items-center gap-1 font-inter">
            {ad.cta_text} →
          </span>
        )}
      </Link>
    </div>
  );
}
