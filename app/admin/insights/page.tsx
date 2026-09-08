"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Eye, FileText, Users, Mail, Award,
  BarChart2, RefreshCw, ArrowUpRight, Layers,
  TrendingUp, MessageSquare, Calendar
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type TimeSeriesPoint = { key: string; label: string; articles: number; impressions: number };

type AnalyticsData = {
  range: { from: string; to: string; days: number };
  totals: { articles: number; impressions: number; users: number; subscribers: number; messages: number };
  inRange: { articles: number; impressions: number; users: number; subscribers: number };
  timeSeriesData: TimeSeriesPoint[];
  topArticles: Array<{ id: string; title: string; category: string; impressions: number; published_at: string }>;
  categoryBreakdown: Record<string, { count: number; impressions: number }>;
};

type Period = "7" | "30" | "90" | "custom";

const CAT_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  business:      { bar: "bg-blue-500",   bg: "bg-blue-50",   text: "text-blue-700" },
  india:         { bar: "bg-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
  world:         { bar: "bg-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  technology:    { bar: "bg-cyan-500",   bg: "bg-cyan-50",   text: "text-cyan-700" },
  markets:       { bar: "bg-green-500",  bg: "bg-green-50",  text: "text-green-700" },
  startups:      { bar: "bg-pink-500",   bg: "bg-pink-50",   text: "text-pink-700" },
  sports:        { bar: "bg-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" },
  entertainment: { bar: "bg-red-500",    bg: "bg-red-50",    text: "text-red-700" },
  lifestyle:     { bar: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700" },
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

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));

  // X-axis labels — show at most 8
  const step = Math.max(1, Math.ceil(data.length / 8));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    // Find closest point
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

        {/* Grid lines */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={PX} y1={toY(v)} x2={W - PX} y2={toY(v)}
              stroke="#f1f5f9" strokeWidth="1"
            />
            <text x={PX - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="system-ui">
              {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={i} x={toX(idx)} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="system-ui">
              {d.label}
            </text>
          );
        })}

        {/* Area fill */}
        {areaD && <path d={areaD} fill={`url(#${gradId})`} />}

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={toX(i)} cy={toY(d[metric])} r={tooltip?.point === d ? 5 : 3}
            fill={color} stroke="white" strokeWidth="2"
          />
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PY} x2={tooltip.x} y2={PY + innerH} stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          </g>
        )}
      </svg>

      {/* Floating tooltip */}
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
  label: string; total: number; inRange: number; period: string;
  icon: React.ReactNode; color: string; textColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        {inRange > 0 && (
          <span className={`text-[11px] ${textColor} font-bold flex items-center gap-0.5 bg-opacity-10 ${color} px-2 py-0.5 rounded-full`}>
            <ArrowUpRight size={10} />+{inRange} {period}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-gray-900 leading-none mb-1">
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
  const [period, setPeriod] = useState<Period>("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [activeMetric, setActiveMetric] = useState<"impressions" | "articles">("impressions");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BarChart2 size={22} className="text-blue-600" /> Insights
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            {/* Segmented pill */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
              {(["7", "30", "90"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    period === p
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {p === "7" ? "7 Days" : p === "30" ? "30 Days" : "90 Days"}
                </button>
              ))}
              <button
                onClick={() => setPeriod(period === "custom" ? "30" : "custom")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  period === "custom"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Calendar size={11} />
                {period === "custom" && customFrom && customTo
                  ? `${customFrom.slice(5)} → ${customTo.slice(5)}`
                  : "Custom"}
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchData}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Custom date popover — appears below */}
          {period === "custom" && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-1">
              <Calendar size={13} className="text-gray-400 flex-shrink-0" />
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
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-medium">Loading analytics...</p>
          </div>
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-400">
          Failed to load. <button onClick={fetchData} className="text-blue-600 underline font-semibold">Retry</button>
        </div>
      ) : (
        <>
          {/* ── KPI Strip ── */}
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
              label="Total Views"
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
              inRange={0}
              period={periodLabel}
              icon={<MessageSquare size={17} className="text-red-500" />}
              color="bg-red-50" textColor="text-red-600"
            />
          </div>

          {/* ── Area Chart ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {activeMetric === "impressions" ? "Impressions Over Time" : "Articles Published"}
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

            {/* Chart summary */}
            <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-black text-gray-900">{data.inRange.impressions}</div>
                <div className="text-[11px] text-gray-400">Views this period</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-gray-900">{data.inRange.articles}</div>
                <div className="text-[11px] text-gray-400">Articles published</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-gray-900">
                  {data.inRange.articles > 0 ? Math.round(data.inRange.impressions / data.inRange.articles) : 0}
                </div>
                <div className="text-[11px] text-gray-400">Avg views/article</div>
              </div>
            </div>
          </div>

          {/* ── Bottom Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Articles */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <Award size={15} className="text-yellow-500" />
                <h3 className="font-bold text-gray-900 text-sm">Top Articles by Views</h3>
                <span className="ml-auto text-xs text-gray-400">All time</span>
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
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-700"
                          style={{ width: `${w}%` }}
                        />
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
                <span className="ml-auto text-xs text-gray-400">All time</span>
              </div>
              <div className="p-5 space-y-3.5">
                {catEntries.length > 0 ? catEntries.map(([cat, stats]) => {
                  const w = Math.max(4, (stats.impressions / maxCatImp) * 100);
                  const c = CAT_COLORS[cat.toLowerCase()] || { bar: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-700" };
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{cat}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {stats.count} articles · <span className="font-bold text-gray-700">{stats.impressions} views</span>
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${c.bar} rounded-full transition-all duration-700`}
                          style={{ width: `${w}%` }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-10 text-center text-sm text-gray-400">No category data yet.</div>
                )}
              </div>

              {/* Category Totals */}
              {catEntries.length > 0 && (
                <div className="px-5 pb-4 pt-2 border-t border-gray-50 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-base font-black text-gray-900">{catEntries.length}</div>
                    <div className="text-[10px] text-gray-400">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-black text-gray-900">{data.totals.articles}</div>
                    <div className="text-[10px] text-gray-400">Total articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-black text-gray-900">{data.totals.impressions}</div>
                    <div className="text-[10px] text-gray-400">Total views</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
