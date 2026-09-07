import Link from "next/link";
import { getActiveAd, AdSlotType } from "@/lib/ads";

const SLOT_SIZES: Record<AdSlotType, { label: string; className: string }> = {
  leaderboard:  { label: "728×90",  className: "w-full max-w-[728px] h-[90px]" },
  sidebar:      { label: "300×250", className: "w-full aspect-[6/5]" },
  in_article:   { label: "300×250", className: "w-full max-w-[300px] aspect-[6/5] mx-auto" },
  homepage_hero:{ label: "970×250", className: "w-full h-[120px] md:h-[200px]" },
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
  const sizes = SLOT_SIZES[slot];

  if (!ad) {
    // No ad configured — show nothing (clean, no grey boxes)
    return null;
  }

  return (
    <div className={`text-center ${className}`}>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Advertisement</span>
      <Link
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-block overflow-hidden ${sizes.className}`}
        title={ad.title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-full object-cover hover:opacity-95 transition-opacity"
        />
      </Link>
    </div>
  );
}
