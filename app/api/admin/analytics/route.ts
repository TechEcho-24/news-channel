import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const toDate = toParam ? new Date(toParam) : new Date();
  toDate.setHours(23, 59, 59, 999);

  const fromDate = fromParam ? new Date(fromParam) : (() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  })();
  fromDate.setHours(0, 0, 0, 0);

  const fromISO = fromDate.toISOString();
  const toISO = toDate.toISOString();

  // Days in range (to decide grouping: daily for <=30d, weekly for <=90d, monthly for >90d)
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86400000);

  const supabase = await createClient();

  try {
    // ── All-time totals (not range-filtered) ──────────────────────────
    const [
      { count: totalArticlesAll },
      { data: allImpressionData },
      { count: totalUsers },
      { count: totalSubscribers },
      { count: totalMessages },
    ] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("impressions, title, category, published_at, id"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("subscribers").select("*", { count: "exact", head: true }),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    ]);

    const totalImpressionsAll = allImpressionData?.reduce((a, b) => a + (b.impressions || 0), 0) ?? 0;

    // ── Range-filtered data ───────────────────────────────────────────
    const [
      { count: articlesInRange },
      { count: usersInRange },
      { count: subscribersInRange },
      { data: rangeArticles },
    ] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true })
        .gte("published_at", fromISO).lte("published_at", toISO),
      supabase.from("profiles").select("*", { count: "exact", head: true })
        .gte("created_at", fromISO).lte("created_at", toISO),
      supabase.from("subscribers").select("*", { count: "exact", head: true })
        .gte("created_at", fromISO).lte("created_at", toISO),
      supabase.from("articles").select("impressions, title, category, published_at, id")
        .gte("published_at", fromISO).lte("published_at", toISO)
        .order("published_at", { ascending: true }),
    ]);

    const impressionsInRange = rangeArticles?.reduce((a, b) => a + (b.impressions || 0), 0) ?? 0;

    // ── Time-series grouping ──────────────────────────────────────────
    // Generate all date buckets in range
    const buckets: Record<string, { articles: number; impressions: number; label: string }> = {};

    const getBucketKey = (dateStr: string) => {
      const d = new Date(dateStr);
      if (daysDiff <= 31) {
        // Daily: YYYY-MM-DD
        return d.toISOString().split("T")[0];
      } else if (daysDiff <= 92) {
        // Weekly: week start (Monday)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d);
        weekStart.setDate(diff);
        return weekStart.toISOString().split("T")[0];
      } else {
        // Monthly: YYYY-MM
        return d.toISOString().substring(0, 7);
      }
    };

    const getLabelForKey = (key: string) => {
      if (daysDiff <= 31) {
        const d = new Date(key);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      } else if (daysDiff <= 92) {
        const d = new Date(key);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      } else {
        const [y, m] = key.split("-");
        return new Date(parseInt(y), parseInt(m) - 1).toLocaleString("en", { month: "short", year: "2-digit" });
      }
    };

    // Pre-fill all buckets in range
    const cur = new Date(fromDate);
    while (cur <= toDate) {
      const key = getBucketKey(cur.toISOString());
      if (!buckets[key]) {
        buckets[key] = { articles: 0, impressions: 0, label: getLabelForKey(key) };
      }
      if (daysDiff <= 31) cur.setDate(cur.getDate() + 1);
      else if (daysDiff <= 92) cur.setDate(cur.getDate() + 7);
      else cur.setMonth(cur.getMonth() + 1);
    }

    // Fill with real data
    rangeArticles?.forEach((a) => {
      const key = getBucketKey(a.published_at);
      if (!buckets[key]) {
        buckets[key] = { articles: 0, impressions: 0, label: getLabelForKey(key) };
      }
      buckets[key].articles++;
      buckets[key].impressions += a.impressions || 0;
    });

    const timeSeriesData = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => ({ key, ...val }));

    // ── Top articles (all time) ───────────────────────────────────────
    const topArticles = (allImpressionData ?? [])
      .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
      .slice(0, 5);

    // ── Category breakdown (all time) ────────────────────────────────
    const categoryBreakdown: Record<string, { count: number; impressions: number }> = {};
    allImpressionData?.forEach((a) => {
      if (!categoryBreakdown[a.category]) categoryBreakdown[a.category] = { count: 0, impressions: 0 };
      categoryBreakdown[a.category].count++;
      categoryBreakdown[a.category].impressions += a.impressions || 0;
    });

    return NextResponse.json({
      range: { from: fromISO, to: toISO, days: daysDiff },
      totals: {
        articles: totalArticlesAll ?? 0,
        impressions: totalImpressionsAll,
        users: totalUsers ?? 0,
        subscribers: totalSubscribers ?? 0,
        messages: totalMessages ?? 0,
      },
      inRange: {
        articles: articlesInRange ?? 0,
        impressions: impressionsInRange,
        users: usersInRange ?? 0,
        subscribers: subscribersInRange ?? 0,
      },
      timeSeriesData,
      topArticles,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
