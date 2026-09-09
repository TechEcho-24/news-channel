import Link from "next/link";
import { getActiveAd, AdSlotType } from "@/lib/ads";
import AdSlotClientTracker from "./AdSlotClientTracker";

const SLOT_SIZES: Record<AdSlotType, { label: string; className: string }> = {
  leaderboard:   { label: "728×90",   className: "w-full max-w-[728px] aspect-[728/90] mx-auto" },
  sidebar:       { label: "300×250",  className: "w-full max-w-[300px] aspect-[300/250] mx-auto" },
  in_article:    { label: "300×250",  className: "w-full max-w-[300px] aspect-[300/250] mx-auto" },
  homepage_hero: { label: "970×250",  className: "w-full max-w-[970px] aspect-[970/250] mx-auto" },
  category_banner: { label: "970×250", className: "w-full max-w-[970px] aspect-[970/250] mx-auto" },
  footer:        { label: "728×90",   className: "w-full max-w-[728px] aspect-[728/90] mx-auto" },
  nav_top:       { label: "970×90",   className: "w-full max-w-[970px] aspect-[970/90] mx-auto" },
  half_page:     { label: "300×600",  className: "w-full max-w-[300px] aspect-[300/600] mx-auto" },
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
    // Show grey placeholder box when no ad is active for this slot
    return (
      <div className={`text-center my-3 ${className}`}>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1 font-inter">
          Advertisement Slot
        </span>
        <Link
          href="/advertise"
          className={`group flex flex-col items-center justify-center bg-gray-100/90 hover:bg-gray-200/80 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-md transition-all p-4 ${sizes.className}`}
        >
          <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 uppercase tracking-wider mb-1 font-inter">
            Advertise Here ({sizes.label})
          </span>
          <span className="text-[11px] text-gray-400 group-hover:text-blue-500 font-medium">
            Click to book this spot →
          </span>
        </Link>
      </div>
    );
  }

  const href = ad.link_url.startsWith("http://") || ad.link_url.startsWith("https://")
    ? ad.link_url
    : `https://${ad.link_url}`;

  return (
    <div className={`text-center my-3 ${className}`}>
      <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1 font-inter">Advertisement</span>
      <AdSlotClientTracker
        adId={ad.id}
        href={href}
        title={ad.title}
        imageUrl={ad.image_url}
        ctaText={ad.cta_text}
        className={sizes.className}
      />
    </div>
  );
}
