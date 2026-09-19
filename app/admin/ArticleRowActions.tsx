"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Link2, Check } from "lucide-react";
import { generateSlug } from "@/lib/api";

export function ArticleRowActions({ article }: { article: { id: string; title: string; category: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const slug = generateSlug(article.title);
    const url = `${window.location.origin}/${article.category.toLowerCase()}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        title="Copy article URL"
        onClick={handleCopy}
        className={`p-2 rounded-lg transition-all ${
          copied
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
        }`}
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
      </button>
      <Link
        href={`/admin/articles/${article.id}/edit`}
        title="Edit article"
        className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
      >
        <Pencil size={14} />
      </Link>
    </div>
  );
}
