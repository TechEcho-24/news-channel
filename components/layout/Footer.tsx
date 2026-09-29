"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
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
    <footer className="bg-white dark:bg-[#111111] border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 relative overflow-hidden font-inter">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-[#472066]"></div>
      
      <div className="container mx-auto px-4 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter (Takes up 5 cols on lg) */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <Image src="/bnblogo.png" alt="BNB Logo" width={120} height={48} className="object-contain h-12 w-auto dark:invert transition-transform duration-300 group-hover:scale-105" />
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
              Bharat News Bulletin (BNB) is a premium digital media organization delivering breaking news, deep business insights, and editorial excellence from India and around the world.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Subscribe to our Newsletter
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Get the latest news and updates delivered straight to your inbox daily.</p>
              
              {status === "already_subscribed" || status === "success" ? (
                <div className={`p-4 rounded-xl border ${status === "success" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"}`}>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {status === "success" ? "Successfully subscribed!" : "You are already subscribed."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address" 
                      required
                      disabled={status === "loading"}
                      className="w-full bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-70 transition-shadow"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={status === "loading"}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md
                      ${status === "error" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"} disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
                  </button>
                </form>
              )}
              {status === "error" && <p className="text-red-500 text-xs mt-2 font-medium">Subscription failed. Please try again.</p>}
            </div>
          </div>

          {/* Spacer for desktop */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Links Section - Grouped together for side-by-side on mobile */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-8">
            {/* News Links */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] sm:text-xs mb-4 sm:mb-6">
                News
              </h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {['India', 'World', 'Business', 'Technology', 'Health', 'Markets', 'Startups', 'Gadgets'].map((cat) => (
                  <li key={cat}>
                    <Link href={`/${cat.toLowerCase()}`} className="inline-flex items-center group hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-300 ease-out text-blue-600 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 hidden sm:inline-block">›</span>
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] sm:text-xs mb-4 sm:mb-6">
                Company
              </h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/about" className="inline-flex items-center group hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-300 ease-out text-blue-600 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 hidden sm:inline-block">›</span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/advertise" className="inline-flex items-center group hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-300 ease-out text-blue-600 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 hidden sm:inline-block">›</span>
                    Advertise
                  </Link>
                </li>
                <li>
                  <Link href="/media-kit" className="inline-flex items-center group hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-300 ease-out text-blue-600 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 hidden sm:inline-block">›</span>
                    Media Kit
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="inline-flex items-center group hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-300 ease-out text-blue-600 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 hidden sm:inline-block">›</span>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="col-span-2 sm:col-span-1 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] sm:text-xs mb-4 sm:mb-6">
                Legal
              </h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex flex-row sm:flex-col gap-4 sm:gap-0 flex-wrap">
                <li>
                  <Link href="/privacy" className="inline-flex items-center group hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-300 ease-out text-blue-600 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 hidden sm:inline-block">›</span>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="inline-flex items-center group hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-300 ease-out text-blue-600 opacity-0 group-hover:opacity-100 mr-0 group-hover:mr-2 hidden sm:inline-block">›</span>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col md:flex-row items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Bharat News Bulletin.</span>
            <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
            <span>All rights reserved.</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <a href="https://www.linkedin.com/company/bharat-news-bulletin/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-[#0077b5] hover:text-white transition-all duration-300 shadow-sm" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61594250281793" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-all duration-300 shadow-sm" title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/bharatnewsbulletin/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all duration-300 shadow-sm" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
}
