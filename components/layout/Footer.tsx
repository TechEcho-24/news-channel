"use client";

import Link from "next/link";
import { Rss, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "already_subscribed">("idle");
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        // Check if they are already in the subscribers table via API (bypasses RLS)
        try {
          const res = await fetch(`/api/newsletter/check?email=${encodeURIComponent(user.email || "")}`);
          const data = await res.json();
          if (data.isSubscribed) {
            setStatus("already_subscribed");
          }
        } catch (e) {
          console.error("Failed to check subscription status", e);
        }
      }
    }
    checkUser();
  }, [supabase]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, preferences: ["Breaking News", "Daily News Digest"] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Subscription failed");
      
      if (data.already_subscribed) {
        setStatus("already_subscribed");
      } else {
        setStatus("success");
        // Reset success message after 3 seconds
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <footer className="bg-gray-50 text-gray-900 pt-16 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <Image src="/bnblogo.png" alt="BNB Logo" width={110} height={44} className="object-contain h-11 w-auto" />
              <span className="border-l-2 border-gray-300 pl-3 text-xs font-bold tracking-widest uppercase text-gray-500 group-hover:text-blue-600 transition-colors leading-tight">
                Bharat News Bulletin
              </span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-sm text-sm leading-relaxed">
              Premium digital media organization delivering breaking news, business insights, and editorial excellence.
            </p>
            
            {status === "already_subscribed" || status === "success" ? (
              <div className={`p-4 rounded-md max-w-sm border ${status === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                <p className="text-sm font-medium">
                  {status === "success" ? "Successfully subscribed!" : "You are already subscribed to our newsletter."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex mt-4 max-w-sm">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  required
                  disabled={status === "loading"}
                  className="bg-white border border-gray-300 text-gray-900 px-4 py-2 flex-1 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:opacity-70"
                />
                <button 
                  type="submit" 
                  disabled={status === "loading"}
                  className={`px-4 py-2 text-sm font-semibold transition-colors rounded-r-md flex items-center justify-center min-w-[100px]
                    ${status === "error" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"} disabled:opacity-70`}
                >
                  {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
                </button>
              </form>
            )}
            {status === "error" && <p className="text-red-600 text-xs mt-2 font-medium">Subscription failed. Try again.</p>}
          </div>

          {/* News Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter text-gray-900">News</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/india" className="hover:text-blue-600 transition-colors">India</Link></li>
              <li><Link href="/world" className="hover:text-blue-600 transition-colors">World</Link></li>
              <li><Link href="/business" className="hover:text-blue-600 transition-colors">Business</Link></li>
              <li><Link href="/technology" className="hover:text-blue-600 transition-colors">Technology</Link></li>
              <li><Link href="/health" className="hover:text-blue-600 transition-colors">Health</Link></li>
              <li><Link href="/markets" className="hover:text-blue-600 transition-colors">Markets</Link></li>
              <li><Link href="/startups" className="hover:text-blue-600 transition-colors">Startups</Link></li>
              <li><Link href="/gadgets" className="hover:text-blue-600 transition-colors">Gadgets</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter text-gray-900">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="/advertise" className="hover:text-blue-600 transition-colors">Advertise With Us</Link></li>
              <li><Link href="/media-kit" className="hover:text-blue-600 transition-colors">Media Kit</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter text-gray-900">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Bharat News Bulletin (BNB). All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://www.linkedin.com/company/bharat-news-bulletin/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61594250281793" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/bharatnewsbulletin/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" title="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <Link href="/feed.xml" className="text-gray-400 hover:text-orange-500 transition-colors" title="RSS Feed">
              <Rss size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
