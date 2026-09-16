"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

export default function GoogleAnalyticsProvider() {
  const pathname = usePathname();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) return null;

  // Do not track admin routes
  if (pathname && pathname.startsWith("/admin")) return null;

  return <GoogleAnalytics gaId={measurementId} />;
}
