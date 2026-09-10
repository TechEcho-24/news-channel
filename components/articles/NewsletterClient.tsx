"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Mail, MailOpen } from "lucide-react";

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
    <div className="bg-white rounded-[40px] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-10 md:p-14 w-full max-w-4xl mx-auto text-center relative z-10 overflow-hidden">
      {/* Background decoration - optional, mimicking the floating envelopes in the screenshot */}
      <div className="absolute top-10 left-10 text-gray-200 opacity-50 transform -rotate-12"><Mail size={32} /></div>
      <div className="absolute top-24 left-32 text-gray-200 opacity-50 transform rotate-12"><Mail size={24} /></div>
      <div className="absolute top-8 right-20 text-gray-200 opacity-50 transform rotate-6"><Mail size={40} /></div>
      <div className="absolute top-32 right-12 text-gray-200 opacity-50 transform -rotate-12"><Mail size={28} /></div>

      <div className="flex justify-center mb-6 relative z-10">
        <div className="text-[#ff5b62]">
          <MailOpen size={80} strokeWidth={1.5} />
        </div>
      </div>
      
      <h2 className="text-3xl font-black mb-3 tracking-wide text-gray-800 uppercase">Subscribe</h2>
      <p className="text-gray-500 mb-10 text-lg">
        Subscribe to our newsletter & stay updated
      </p>
      
      {status === "success" ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-md">
          <h3 className="text-xl font-bold mb-2">Thank you!</h3>
          <p className="text-sm">You have successfully subscribed with <strong>{email}</strong>.</p>
          <button 
            onClick={() => setStatus("already_subscribed")} 
            className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
          >
            Update preferences
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="relative z-10 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="flex-1 w-full flex items-center bg-gray-100 rounded-md px-5 py-4 focus-within:ring-2 focus-within:ring-blue-600 transition-all">
              <Mail className="text-gray-400 mr-3" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email" 
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 outline-none w-full"
                required
                disabled={isSubmitting || status === "already_subscribed"}
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-md transition-colors flex justify-center items-center shadow-lg shadow-blue-600/30 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : status === "already_subscribed" ? "Update" : "Submit"}
            </button>
          </div>
          
          {status === "error" && (
            <p className="text-red-500 text-sm mt-4">Something went wrong. Please try again later.</p>
          )}

          {status === "already_subscribed" && !isSubmitting && (
            <p className="text-blue-600 text-sm mt-4">You are already subscribed. Update your preferences below.</p>
          )}

          <div className="mt-8 opacity-0 h-0 overflow-hidden">
            {/* Keeping the preferences hidden but functional since the screenshot didn't have them, but they are needed for the backend logic. Or we can just let them be defaulted. */}
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {["Breaking News", "Daily News Digest", "Technology", "Business"].map(option => (
                <label key={option} className="flex items-center space-x-1 cursor-pointer">
                  <input type="checkbox" checked={preferences.includes(option)} onChange={() => handleCheckboxChange(option)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
