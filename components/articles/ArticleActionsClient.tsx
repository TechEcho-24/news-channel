"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart2, MessageSquare, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ArticleActionsProps {
  articleId: string;
  initialImpressions: number;
}

export default function ArticleActionsClient({ articleId, initialImpressions }: ArticleActionsProps) {
  const [impressions, setImpressions] = useState(initialImpressions || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const hasRecorded = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (hasRecorded.current) return;
    hasRecorded.current = true;

    const recordImpression = async () => {
      // Immediate UI update on view
      setImpressions(prev => prev + 1);

      // Record view in database instantly without 3-hour timer delay
      const { error: rpcError } = await supabase.rpc('increment_impressions', { row_id: articleId });
      if (rpcError) {
        const { data: art } = await supabase
          .from('articles')
          .select('impressions')
          .eq('id', articleId)
          .single();

        if (art) {
          const current = (art as any).impressions || 0;
          await supabase
            .from('articles')
            .update({ impressions: current + 1 })
            .eq('id', articleId);
        }
      }
    };

    recordImpression();
  }, [articleId, supabase]);

  return (
    <div className="mt-8 mb-12">
      {/* Action Bar */}
      <div className="flex items-center space-x-6 border-y border-gray-200 py-3 mb-6 font-inter">
        <div className="flex items-center text-gray-600 space-x-2">
          <BarChart2 size={20} className="text-blue-600" />
          <span className="font-semibold text-sm">{impressions.toLocaleString()} Impressions</span>
        </div>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center text-gray-600 space-x-2 hover:text-blue-600 transition-colors"
        >
          <MessageSquare size={20} className="text-gray-400 group-hover:text-blue-600" />
          <span className="font-semibold text-sm">Comment</span>
        </button>
      </div>

      {/* Comments Section Toggle */}
      {showComments && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="font-bold text-lg mb-4">Comments</h3>
          
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-500 font-bold">
              U
            </div>
            <div className="flex-1 relative">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
              />
              <button className="absolute bottom-3 right-3 text-white bg-blue-600 p-1.5 rounded-md hover:bg-blue-700 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
             <p className="text-sm text-gray-500 italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>
          </div>
        </div>
      )}
    </div>
  );
}
