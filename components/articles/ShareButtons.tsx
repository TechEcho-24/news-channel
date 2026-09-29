"use client";

import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log("Failed to copy", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleShare}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        title="Share"
      >
        <Share2 size={15} />
      </button>
      <button 
        onClick={handleCopy}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        title="Copy Link"
      >
        {copied ? <Check size={15} className="text-green-600 dark:text-green-400" /> : <LinkIcon size={15} />}
      </button>
    </div>
  );
}
