import Link from "next/link";
import { Users, FileText, Eye, TrendingUp, Edit } from "lucide-react";
import { getLatestArticles } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 0;

export default async function AdminDashboard() {
  const latestArticles = await getLatestArticles(10);
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/admin/articles/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          + Write News
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Articles</h3>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold">1,248</div>
          <div className="text-sm text-green-600 font-medium mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" /> +12 this week
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Views</h3>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <Eye size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold">45.2K</div>
          <div className="text-sm text-green-600 font-medium mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" /> +5.4% this week
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Subscribers</h3>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold">8,591</div>
          <div className="text-sm text-green-600 font-medium mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" /> +124 this week
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold">Recently Published</h2>
          <Link href="/admin/articles" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-200">
          {latestArticles.map((article) => (
            <div key={article.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 line-clamp-1">{article.title}</h4>
                <div className="text-sm text-gray-500 mt-1 flex space-x-3">
                  <span className="capitalize">{article.category}</span>
                  <span>•</span>
                  <span>Published {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-semibold rounded-full uppercase tracking-wider">Published</span>
                <Link href={`/admin/articles/${article.id}/edit`} className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md">
                  <Edit size={14} className="mr-1.5" /> Edit
                </Link>
              </div>
            </div>
          ))}
          {latestArticles.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No articles published yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
