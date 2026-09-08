"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function NewsletterClient() {
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<string[]>(["Breaking News", "Daily News Digest"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "already_subscribed">("idle");
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  // Check if user is logged in
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || "");
        
        // Check if they are already in the subscribers table
        const { data } = await supabase
          .from('subscribers')
          .select('preferences')
          .eq('email', user.email)
          .maybeSingle();
          
        if (data) {
          setStatus("already_subscribed");
          if (data.preferences && data.preferences.length > 0) {
            setPreferences(data.preferences);
          }
        }
      }
    }
    checkUser();
  }, [supabase]);

  const handleCheckboxChange = (option: string) => {
    setPreferences(prev => 
      prev.includes(option) 
        ? prev.filter(p => p !== option)
        : [...prev, option]
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setStatus("idle");
    
    try {
      // Upsert: If email already exists, update the preferences instead of failing
      const { error } = await supabase
        .from('subscribers')
        .upsert({ 
          email: email.toLowerCase(), 
          preferences,
          user_id: user ? user.id : null
        }, { onConflict: 'email' });
        
      if (error) throw error;
      
      setStatus("success");
      
      // Also update profiles table if logged in, just to keep in sync with the top header subscribe button
      if (user) {
        await supabase.from('profiles').update({ is_subscribed: true }).eq('id', user.id);
      }
      
    } catch (error) {
      console.error("Subscription error:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl text-center">
      <h2 className="text-3xl font-serif font-bold mb-4">Stay Ahead of the News</h2>
      <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
        Get important stories, breaking updates, and editor's picks delivered directly to you.
      </p>
      
      {status === "success" ? (
        <div className="bg-green-900/20 border border-green-500 text-green-400 p-6 rounded-lg max-w-xl mx-auto">
          <h3 className="text-xl font-bold mb-2">Thank you for subscribing!</h3>
          <p className="text-sm">We've saved your preferences. You'll receive updates at <strong>{email}</strong>.</p>
          <button 
            onClick={() => setStatus("already_subscribed")} 
            className="mt-4 text-xs underline text-gray-400 hover:text-white"
          >
            Update preferences
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="max-w-xl mx-auto">
          <div className="bg-white p-1 flex rounded-md overflow-hidden">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address" 
              className="flex-1 text-black px-4 py-3 outline-none disabled:bg-gray-100"
              required
              disabled={status === "already_subscribed" && !!user}
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 transition-colors flex items-center disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : status === "already_subscribed" ? "Update" : "Subscribe"}
            </button>
          </div>
          
          {status === "error" && (
            <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again later.</p>
          )}

          {status === "already_subscribed" && !isSubmitting && (
            <p className="text-blue-400 text-sm mt-3">You are already subscribed. You can update your preferences below.</p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            {["Breaking News", "Daily News Digest", "Technology", "Business"].map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer hover:text-white transition-colors">
                <input 
                  type="checkbox" 
                  checked={preferences.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="accent-blue-600 w-4 h-4" 
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </form>
      )}
    </div>
  );
}
