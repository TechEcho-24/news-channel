"use client";

import { useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Track viewport entry count: 4 viewport views = 1 impression
          const key = `ad_view_count_${adId}`;
          const currentCount = parseInt(sessionStorage.getItem(key) || "0", 10) + 1;
          
          if (currentCount >= 4) {
            // Reached 4 viewport entries -> trigger +1 impression
            sessionStorage.setItem(key, "0");
            fetch("/api/ads/impression", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adId }),
            }).catch(() => {});
          } else {
            sessionStorage.setItem(key, currentCount.toString());
          }

          // Unobserve temporarily to avoid instant re-trigger in same view state
          observer.unobserve(entry.target);
          setTimeout(() => {
            if (containerRef.current) observer.observe(containerRef.current);
          }, 1500);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [adId]);

  function handleClick() {
    // Direct click = 1 click (+1 click & +1 impression immediately)
    fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId }),
      keepalive: true,
    }).catch(() => {});

    fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <Link
      ref={containerRef}
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
