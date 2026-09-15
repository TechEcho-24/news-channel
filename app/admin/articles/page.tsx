"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Eye, Edit, FileText, Search, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function AllArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("All");

  useEffect(() => {
    async function fetchArticles() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false });

      if (!error && data) {
        setArticles(data);
      }
      setIsLoading(false);
    }
    fetchArticles();
  }, []);

  // Compute author counts
  const authorCounts = useMemo(() => {
    const counts: Record<string, number> = { "All": articles.length };
    articles.forEach(article => {
      const author = article.author_name || "Unknown";
      counts[author] = (counts[author] || 0) + 1;
    });
    return counts;
  }, [articles]);

  // Filter articles based on search and selected author
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
      const matchesAuthor = selectedAuthor === "All" || (article.author_name || "Unknown") === selectedAuthor;
      return matchesSearch && matchesAuthor;
    });
  }, [articles, search, selectedAuthor]);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Articles</h1>
          <p className="text-gray-500 mt-1">
            Manage and filter all published news articles.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
        >
          <FileText size={18} className="mr-2" />
          Write News
        </Link>
      </div>

      {/* Author Filter Tabs */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Filter by Author</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(authorCounts).map(([author, count]) => (
            <button
              key={author}
              onClick={() => setSelectedAuthor(author)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedAuthor === author
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {author}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                selectedAuthor === author ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 lg:w-80"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Showing {filteredArticles.length} articles
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No articles found matching your criteria.
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate text-[15px]">{article.title}</h4>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span className="capitalize bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">{article.category}</span>
                    <span className="flex items-center text-gray-400 font-medium before:content-['•'] before:mr-2 before:text-gray-300">
                      By {article.author_name || "Unknown"}
                    </span>
                    <span className="flex items-center before:content-['•'] before:mr-2 before:text-gray-300">
                      {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1 before:content-['•'] before:mr-2 before:text-gray-300">
                      <Eye size={12} /> {article.impressions || 0} views
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase tracking-wider">
                    Published
                  </span>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit size={14} className="mr-1.5" /> Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
