import Link from "next/link";
import {
  Users, FileText, Eye, TrendingUp, Edit, BarChart2,
  Mail, MessageSquare, Newspaper, TrendingDown, Minus
} from "lucide-react";
import { getLatestArticles } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

async function getStats() {
  const supabase = await createClient();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  const [
    { count: totalArticles },
    { count: articlesThisWeek },
    { data: impressionData },
    { count: totalUsers },
    { count: usersThisMonth },
    { count: totalSubscribers },
    { count: subscribersThisMonth },
    { count: totalMessages },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).gte("published_at", oneWeekAgo.toISOString()),
    supabase.from("articles").select("impressions"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", oneMonthAgo.toISOString()),
    supabase.from("subscribers").select("*", { count: "exact", head: true }),
    supabase.from("subscribers").select("*", { count: "exact", head: true }).gte("created_at", oneMonthAgo.toISOString()),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
  ]);

  const totalImpressions = impressionData?.reduce((a, b) => a + (b.impressions || 0), 0) ?? 0;

  return {
    totalArticles: totalArticles ?? 0,
    articlesThisWeek: articlesThisWeek ?? 0,
    totalImpressions,
    totalUsers: totalUsers ?? 0,
    usersThisMonth: usersThisMonth ?? 0,
    totalSubscribers: totalSubscribers ?? 0,
    subscribersThisMonth: subscribersThisMonth ?? 0,
    totalMessages: totalMessages ?? 0,
  };
}

function StatCard({
  title, value, sub, subPositive, icon, color,
}: {
  title: string;
  value: string | number;
  sub: string;
  subPositive?: boolean;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500">{title}</span>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className={`text-xs font-semibold flex items-center gap-1 ${subPositive === false ? "text-gray-400" : "text-green-600"}`}>
        {subPositive !== false ? <TrendingUp size={12} /> : <Minus size={12} />}
        {sub}
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const [latestArticles, stats] = await Promise.all([
    getLatestArticles(8),
    getStats(),
  ]);

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back — here's what's happening today.</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Newspaper size={16} /> Write News
        </Link>
      </div>

      {/* Stats Grid — Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard
          title="Total Articles"
          value={stats.totalArticles.toLocaleString()}
          sub={`+${stats.articlesThisWeek} this week`}
          subPositive={stats.articlesThisWeek > 0}
          icon={<FileText size={20} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Total Impressions"
          value={stats.totalImpressions >= 1000 ? `${(stats.totalImpressions / 1000).toFixed(1)}K` : stats.totalImpressions.toString()}
          sub="all time views"
          subPositive={stats.totalImpressions > 0}
          icon={<Eye size={20} className="text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="Registered Users"
          value={stats.totalUsers.toLocaleString()}
          sub={`+${stats.usersThisMonth} this month`}
          subPositive={stats.usersThisMonth > 0}
          icon={<Users size={20} className="text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          title="Newsletter Subscribers"
          value={stats.totalSubscribers.toLocaleString()}
          sub={stats.subscribersThisMonth > 0 ? `+${stats.subscribersThisMonth} this month` : "total subscribers"}
          subPositive={stats.subscribersThisMonth > 0}
          icon={<Mail size={20} className="text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Link href="/admin/insights" className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl flex items-center gap-3 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md">
          <BarChart2 size={20} />
          <span className="font-bold text-sm">View Insights</span>
        </Link>
        <Link href="/admin/articles" className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm">
          <FileText size={20} className="text-gray-600" />
          <span className="font-bold text-sm text-gray-700">All Articles</span>
        </Link>
        <Link href="/admin/users" className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm">
          <Users size={20} className="text-gray-600" />
          <span className="font-bold text-sm text-gray-700">Manage Users</span>
        </Link>
        <Link href="/admin/inbox" className="bg-white border border-gray-200 p-4 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm relative">
          <MessageSquare size={20} className="text-gray-600" />
          <span className="font-bold text-sm text-gray-700">Inbox</span>
          {(stats.totalMessages || 0) > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {stats.totalMessages}
            </span>
          )}
        </Link>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Recently Published</h2>
          <Link href="/admin/articles" className="text-xs text-blue-600 font-semibold hover:underline">
            View All →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {latestArticles.map((article) => (
            <div
              key={article.id}
              className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-3"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate text-sm">{article.title}</h4>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded font-medium">{article.category}</span>
                  <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                  <span className="flex items-center gap-0.5">
                    <Eye size={11} /> {article.impressions || 0} views
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase tracking-wider">
                  Published
                </span>
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Edit size={13} className="mr-1" /> Edit
                </Link>
              </div>
            </div>
          ))}
          {latestArticles.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No articles published yet.{" "}
              <Link href="/admin/articles/new" className="text-blue-600 font-semibold hover:underline">
                Write your first story →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
