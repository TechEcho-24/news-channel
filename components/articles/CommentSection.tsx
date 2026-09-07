"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Loader2, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
      await fetchComments();
      setLoading(false);
    }
    init();
  }, [articleId]);

  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id, profiles(full_name)")
      .eq("article_id", articleId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data as unknown as Comment[]);
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setPosting(true);
    setError(null);

    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      setError("Could not post comment. Please try again.");
    } else {
      setNewComment("");
      await fetchComments();
    }
    setPosting(false);
  };

  const getDisplayName = (comment: Comment) => {
    return comment.profiles?.full_name || "Reader";
  };

  const getInitial = (comment: Comment) => {
    const name = comment.profiles?.full_name;
    return name ? name.charAt(0).toUpperCase() : "R";
  };

  return (
    <div className="border-t border-gray-200 pt-12">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <MessageCircle size={24} className="text-blue-600" />
        Join the Conversation
        {comments.length > 0 && (
          <span className="text-base font-normal text-gray-500 ml-1">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* Comment Input */}
      {user ? (
        <form onSubmit={handlePostComment} className="mb-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={posting || !newComment.trim()}
                  className="absolute bottom-3 right-3 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {posting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              <p className="text-xs text-gray-400 mt-1">
                Commenting as <span className="font-medium text-gray-600">{profile?.full_name || user.email}</span>
              </p>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-800">Want to share your thoughts?</p>
            <p className="text-sm text-gray-500 mt-1">Sign in to comment on this story.</p>
          </div>
          <Link
            href="/login"
            className="flex-shrink-0 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Sign in to comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-gray-400" size={24} />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm py-4 text-center">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-600 font-bold text-sm">
                {getInitial(comment)}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="font-semibold text-sm text-gray-900">{getDisplayName(comment)}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
