"use client";

import { useEffect } from "react";
import Link from "next/link";

interface AdSlotClientTrackerProps {
  adId: string;
  href: string;
  title: string;
  imageUrl: string;
  ctaText?: string | null;
  className: string;
}

export default function AdSlotClientTracker({
  adId,
  href,
  title,
  imageUrl,
  ctaText,
  className,
}: AdSlotClientTrackerProps) {
  useEffect(() => {
    // Record view impression on mount
    fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId }),
    }).catch(() => {});
  }, [adId]);

  function handleClick() {
    // Record click reliably using keepalive fetch
    fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={`group relative block overflow-hidden rounded-md border border-gray-200/80 shadow-xs bg-gray-50 ${className}`}
      title={title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
      />

      {ctaText && (
        <span className="absolute bottom-2.5 right-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-md group-hover:bg-blue-800 transition-colors flex items-center gap-1 font-inter z-10">
          {ctaText} →
        </span>
      )}
    </Link>
  );
}
