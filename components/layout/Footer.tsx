"use client";

import Link from "next/link";
import { Globe, Link as LinkIcon, Rss, Share2, Loader2, CheckCircle2 } from "lucide-react";
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
            <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Globe size={20} /></Link>
            <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Share2 size={20} /></Link>
            <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><LinkIcon size={20} /></Link>
            <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Rss size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
