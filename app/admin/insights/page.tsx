"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Eye, FileText, Users, Mail, Award,
  BarChart2, RefreshCw, ArrowUpRight, Layers,
  TrendingUp, MessageSquare, Calendar, Megaphone, MousePointer, X, Printer, ExternalLink
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type TimeSeriesPoint = { key: string; label: string; articles: number; impressions: number };

type AdItem = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  slot: string;
  is_active: boolean;
  impressions?: number;
  clicks?: number;
  starts_at?: string;
  ends_at?: string;
};

type AnalyticsData = {
  range: { from: string; to: string; days: number };
  totals: { articles: number; impressions: number; users: number; subscribers: number; messages: number };
  inRange: { articles: number; impressions: number; users: number; subscribers: number };
  timeSeriesData: TimeSeriesPoint[];
  topArticles: Array<{ id: string; title: string; category: string; impressions: number; published_at: string }>;
  categoryBreakdown: Record<string, { count: number; impressions: number }>;
  adAnalytics?: {
    totalAds: number;
    activeAds: number;
    totalImpressions: number;
    totalClicks: number;
    avgCtr: string;
    adsList: AdItem[];
  };
};

type Period = "7" | "30" | "90" | "custom";

const CAT_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  business:      { bar: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700" },
  india:         { bar: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
  world:         { bar: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  technology:    { bar: "bg-cyan-500",   bg: "bg-cyan-50",   text: "text-cyan-700" },
  health:        { bar: "bg-emerald-500",bg: "bg-emerald-50",text: "text-emerald-700" },
  markets:       { bar: "bg-green-500",  bg: "bg-green-50",  text: "text-green-700" },
  startups:      { bar: "bg-pink-500",   bg: "bg-pink-50",   text: "text-pink-700" },
  sports:        { bar: "bg-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" },
  entertainment: { bar: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700" },
  lifestyle:     { bar: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700" },
};

const SLOT_NAMES: Record<string, string> = {
  leaderboard: "Leaderboard (728×90)",
  sidebar: "Sidebar Box (300×250)",
  in_article: "In-Article (300×250)",
  homepage_hero: "Homepage Hero Banner (970×250)",
  category_banner: "Category Billboard (970×250)",
  footer: "Footer Banner (728×90)",
  nav_top: "Navbar Banner (970×90)",
  half_page: "Half Page Sticky (300×600)",
};

// ── SVG Area Chart ────────────────────────────────────────────────────────────
function AreaChart({ data, metric }: { data: TimeSeriesPoint[]; metric: "impressions" | "articles" }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: TimeSeriesPoint } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 800, H = 200, PX = 48, PY = 16, PB = 32;
  const innerW = W - PX * 2;
  const innerH = H - PY - PB;

  const values = data.map((d) => d[metric]);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const toX = (i: number) => PX + (i / Math.max(data.length - 1, 1)) * innerW;
  const toY = (v: number) => PY + innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d[metric])}`).join(" ");
  const areaD = data.length > 0
    ? `${pathD} L${toX(data.length - 1)},${PY + innerH} L${toX(0)},${PY + innerH} Z`
    : "";

  const color = metric === "impressions" ? "#3b82f6" : "#10b981";
  const gradId = `grad-${metric}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));
  const step = Math.max(1, Math.ceil(data.length / 8));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    let closest = 0;
    let minDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(toX(i) - mx);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setTooltip({ x: toX(closest), y: toY(data[closest][metric]), point: data[closest] });
  };

  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
        No data for this period
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PX} y1={toY(v)} x2={W - PX} y2={toY(v)} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PX - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="system-ui">
              {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            </text>
          </g>
        ))}

        {xLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={i} x={toX(idx)} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="system-ui">
              {d.label}
            </text>
          );
        })}

        {areaD && <path d={areaD} fill={`url(#${gradId})`} />}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {data.map((d, i) => (
          <circle
            key={i}
            cx={toX(i)} cy={toY(d[metric])} r={tooltip?.point === d ? 5 : 3}
            fill={color} stroke="white" strokeWidth="2"
          />
        ))}

        {tooltip && (
          <line x1={tooltip.x} y1={PY} x2={tooltip.x} y2={PY + innerH} stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
        )}
      </svg>

      {tooltip && (
        <div
          className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl z-10 min-w-[120px]"
          style={{ left: `${(tooltip.x / W) * 100}%`, top: `${(tooltip.y / H) * 100}%`, transform: "translate(-50%, -130%)" }}
        >
          <div className="font-bold mb-0.5">{tooltip.point.label}</div>
          <div className="flex items-center gap-1">
            <Eye size={10} /> {tooltip.point.impressions} views
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <FileText size={10} /> {tooltip.point.articles} articles
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, total, inRange, period, icon, color, textColor }: {
  label: string; total: number; inRange?: number; period?: string;
  icon: React.ReactNode; color: string; textColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {inRange !== undefined && inRange > 0 && (
          <span className={`text-[11px] ${textColor} font-bold flex items-center gap-0.5 bg-opacity-10 ${color} px-2 py-0.5 rounded-full`}>
            <ArrowUpRight size={10} />+{inRange} {period}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-gray-900 leading-none mb-1 font-inter">
        {total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"traffic" | "ads">("traffic");
  const [period, setPeriod] = useState<Period>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [activeMetric, setActiveMetric] = useState<"impressions" | "articles">("impressions");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedAdForReport, setSelectedAdForReport] = useState<AdItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const today = new Date();
    let from: Date;
    let to = new Date(today);

    if (period === "custom" && customFrom && customTo) {
      from = new Date(customFrom);
      to = new Date(customTo);
    } else {
      from = new Date(today);
      from.setDate(from.getDate() - parseInt(period));
    }

    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];

    try {
      const res = await fetch(`/api/admin/analytics?from=${fromStr}&to=${toStr}`, { cache: "no-store" });
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => {
    if (period !== "custom") fetchData();
  }, [period]);

  const periodLabel = period === "7" ? "last 7 days" : period === "30" ? "last 30 days" : period === "90" ? "last 90 days" : "custom range";

  const catEntries = data
    ? Object.entries(data.categoryBreakdown).sort((a, b) => b[1].impressions - a[1].impressions)
    : [];
  const maxCatImp = Math.max(...catEntries.map(([, v]) => v.impressions), 1);

  return (
    <div className="p-6 max-w-7xl">
      {/* ── Header & Main Tabs ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BarChart2 size={24} className="text-blue-600" /> Analytics & Performance Insights
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time analytics for news content traffic and local vendor ad performance.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1.5 rounded-xl gap-1 border border-gray-200/80">
          <button
            onClick={() => setActiveTab("traffic")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "traffic" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingUp size={15} />
            Content & Reader Traffic
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "ads" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Megaphone size={15} />
            Ad & Vendor Insights
          </button>
        </div>
      </div>

      {/* Date Range Selector & Refresh */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs text-gray-400">
          Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
            {(["7", "30", "90"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {p === "7" ? "7 Days" : p === "30" ? "30 Days" : "90 Days"}
              </button>
            ))}
            <button
              onClick={() => setPeriod(period === "custom" ? "30" : "custom")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                period === "custom" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Calendar size={12} />
              Custom
            </button>
          </div>

          <button
            onClick={fetchData}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {period === "custom" && (
        <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 mb-6">
          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="border-0 bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
          />
          <span className="text-gray-300 font-bold">→</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="border-0 bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
          />
          <button
            onClick={fetchData}
            disabled={!customFrom || !customTo}
            className="ml-2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Apply Range
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-medium">Loading analytics dashboard...</p>
          </div>
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-400">
          Failed to load data. <button onClick={fetchData} className="text-blue-600 underline font-semibold">Retry</button>
        </div>
      ) : (
        <>
          {/* TAB 1 — CONTENT & READER TRAFFIC */}
          {activeTab === "traffic" && (
            <>
              {/* KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <StatCard
                  label="Total Articles"
                  total={data.totals.articles}
                  inRange={data.inRange.articles}
                  period={periodLabel}
                  icon={<FileText size={17} className="text-blue-600" />}
                  color="bg-blue-50" textColor="text-blue-600"
                />
                <StatCard
                  label="Total Article Views"
                  total={data.totals.impressions}
                  inRange={data.inRange.impressions}
                  period={periodLabel}
                  icon={<Eye size={17} className="text-green-600" />}
                  color="bg-green-50" textColor="text-green-600"
                />
                <StatCard
                  label="Registered Users"
                  total={data.totals.users}
                  inRange={data.inRange.users}
                  period={periodLabel}
                  icon={<Users size={17} className="text-purple-600" />}
                  color="bg-purple-50" textColor="text-purple-600"
                />
                <StatCard
                  label="Subscribers"
                  total={data.totals.subscribers}
                  inRange={data.inRange.subscribers}
                  period={periodLabel}
                  icon={<Mail size={17} className="text-orange-600" />}
                  color="bg-orange-50" textColor="text-orange-600"
                />
                <StatCard
                  label="Inbox Messages"
                  total={data.totals.messages}
                  icon={<MessageSquare size={17} className="text-red-500" />}
                  color="bg-red-50" textColor="text-red-600"
                />
              </div>

              {/* Area Chart */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {activeMetric === "impressions" ? "Article Impressions Over Time" : "Articles Published"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {data.range.days} day window — {data.inRange[activeMetric]} in selected period
                    </p>
                  </div>
                  <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveMetric("impressions")}
                      className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${
                        activeMetric === "impressions" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-1.5"><Eye size={12} /> Views</span>
                    </button>
                    <button
                      onClick={() => setActiveMetric("articles")}
                      className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${
                        activeMetric === "articles" ? "bg-white shadow-sm text-green-600" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-1.5"><FileText size={12} /> Articles</span>
                    </button>
                  </div>
                </div>

                <AreaChart data={data.timeSeriesData} metric={activeMetric} />
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Articles */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                    <Award size={15} className="text-yellow-500" />
                    <h3 className="font-bold text-gray-900 text-sm">Top Articles by Views</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.topArticles.length > 0 ? data.topArticles.map((art, i) => {
                      const maxV = data.topArticles[0].impressions || 1;
                      const w = Math.max(4, (art.impressions / maxV) * 100);
                      return (
                        <div key={art.id} className="px-5 py-3.5">
                          <div className="flex items-start gap-3 mb-2">
                            <span className={`text-sm font-black flex-shrink-0 w-5 text-center ${
                              i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-200"
                            }`}>#{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">{art.title}</p>
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{art.category}</span>
                            </div>
                            <span className="text-sm font-black text-blue-600 flex-shrink-0 flex items-center gap-0.5">
                              <Eye size={12} />{art.impressions}
                            </span>
                          </div>
                          <div className="ml-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${w}%` }} />
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="px-5 py-10 text-center text-sm text-gray-400">No articles with views yet.</div>
                    )}
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                    <Layers size={15} className="text-blue-500" />
                    <h3 className="font-bold text-gray-900 text-sm">Content by Category</h3>
                  </div>
                  <div className="p-5 space-y-3.5">
                    {catEntries.length > 0 ? catEntries.map(([cat, stats]) => {
                      const w = Math.max(4, (stats.impressions / maxCatImp) * 100);
                      const c = CAT_COLORS[cat.toLowerCase()] || { bar: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-700" };
                      return (
                        <div key={cat}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{cat}</span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              {stats.count} articles · <span className="font-bold text-gray-700">{stats.impressions} views</span>
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${w}%` }} />
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="py-10 text-center text-sm text-gray-400">No category data yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2 — AD & VENDOR ANALYTICS */}
          {activeTab === "ads" && (
            <>
              {/* Ad Stats KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Total Ad Views"
                  total={data.adAnalytics?.totalImpressions || 0}
                  icon={<Eye size={18} className="text-blue-600" />}
                  color="bg-blue-50" textColor="text-blue-600"
                />
                <StatCard
                  label="Total Ad Clicks"
                  total={data.adAnalytics?.totalClicks || 0}
                  icon={<MousePointer size={18} className="text-green-600" />}
                  color="bg-green-50" textColor="text-green-600"
                />
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                    <BarChart2 size={18} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-700 leading-none mb-1 font-inter">
                    {data.adAnalytics?.avgCtr || "0.0"}%
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Average Click Rate (CTR)</div>
                </div>
                <StatCard
                  label="Active Vendor Campaigns"
                  total={data.adAnalytics?.activeAds || 0}
                  icon={<Megaphone size={18} className="text-purple-600" />}
                  color="bg-purple-50" textColor="text-purple-600"
                />
              </div>

              {/* Vendor Campaigns Performance Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Local Vendor Campaigns & Ad Slots Performance</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time impression views, clicks, and click-through rates (CTR) per campaign.</p>
                  </div>
                </div>

                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Vendor / Campaign</th>
                      <th className="py-3.5 px-5">Slot Location</th>
                      <th className="py-3.5 px-5">Views (Impressions)</th>
                      <th className="py-3.5 px-5">Clicks</th>
                      <th className="py-3.5 px-5">CTR %</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Vendor Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {!data.adAnalytics?.adsList || data.adAnalytics.adsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          No active ad campaigns yet. Add campaigns from the Ads tab.
                        </td>
                      </tr>
                    ) : (
                      data.adAnalytics.adsList.map((ad) => {
                        const views = ad.impressions || 0;
                        const clicks = ad.clicks || 0;
                        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

                        return (
                          <tr key={ad.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ad.image_url} alt={ad.title} className="w-16 h-10 object-cover rounded border border-gray-200 flex-shrink-0" />
                                <div>
                                  <div className="font-bold text-sm text-gray-900">{ad.title}</div>
                                  <a href={ad.link_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                                    {ad.link_url.replace("https://", "").replace("http://", "").substring(0, 25)}... <ExternalLink size={10} />
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                                {SLOT_NAMES[ad.slot] || ad.slot}
                              </span>
                            </td>
                            <td className="py-4 px-5 font-bold text-sm text-gray-900">
                              <div className="flex items-center gap-1.5">
                                <Eye size={15} className="text-blue-500" />
                                {views.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-4 px-5 font-bold text-sm text-gray-900">
                              <div className="flex items-center gap-1.5">
                                <MousePointer size={15} className="text-green-500" />
                                {clicks.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-4 px-5 font-bold text-sm">
                              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-mono text-xs">
                                {ctr}%
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              {ad.is_active ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                  ● Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                  Paused
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={() => setSelectedAdForReport(ad)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors inline-flex items-center gap-1 shadow-sm"
                              >
                                <Printer size={13} /> Vendor Report
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Branded Vendor Performance Proof Report Modal */}
      {selectedAdForReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-5 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest font-inter">Official Vendor Performance Statement</span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">{selectedAdForReport.title}</h2>
              </div>
              <button onClick={() => setSelectedAdForReport(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {/* Banner Preview */}
            <div className="mb-5 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedAdForReport.image_url} alt={selectedAdForReport.title} className="w-full max-h-36 object-contain rounded" />
            </div>

            {/* Performance Stat Cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 text-center">
                <Eye size={18} className="mx-auto text-blue-600 mb-1" />
                <span className="text-2xl font-black text-blue-900 block font-inter">
                  {(selectedAdForReport.impressions || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Total Views</span>
              </div>

              <div className="bg-green-50/80 p-3.5 rounded-xl border border-green-100 text-center">
                <MousePointer size={18} className="mx-auto text-green-600 mb-1" />
                <span className="text-2xl font-black text-green-900 block font-inter">
                  {(selectedAdForReport.clicks || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Total Clicks</span>
              </div>

              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-100 text-center">
                <BarChart2 size={18} className="mx-auto text-amber-600 mb-1" />
                <span className="text-2xl font-black text-amber-900 block font-inter">
                  {(selectedAdForReport.impressions || 0) > 0 
                    ? (((selectedAdForReport.clicks || 0) / (selectedAdForReport.impressions || 1)) * 100).toFixed(1)
                    : "0.0"}%
                </span>
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Click Rate</span>
              </div>
            </div>

            {/* Official Proof Statement */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs text-gray-700 leading-relaxed mb-6 space-y-2">
              <p><strong className="text-gray-900">Placement Slot:</strong> {SLOT_NAMES[selectedAdForReport.slot] || selectedAdForReport.slot}</p>
              <p><strong className="text-gray-900">Target Website Link:</strong> <a href={selectedAdForReport.link_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{selectedAdForReport.link_url}</a></p>
              <div className="pt-2 border-t border-gray-200 text-gray-800 italic font-medium">
                "This campaign has delivered <strong>{(selectedAdForReport.impressions || 0).toLocaleString()} verified views</strong> and <strong>{(selectedAdForReport.clicks || 0).toLocaleString()} direct clicks</strong> to the advertiser's landing page on Bharat News Bulletin (BNB)."
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <Printer size={16} />
                Print Vendor Proof Report
              </button>
              <button
                onClick={() => setSelectedAdForReport(null)}
                className="px-5 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
