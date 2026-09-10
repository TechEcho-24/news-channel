"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function SubscriptionPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    // Check if user is logged in and if they are already subscribed
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('is_subscribed').eq('id', user.id).single();
        if (data?.is_subscribed) {
          setIsSubscribed(true);
        }
      }
    };
    
    checkUser();

    // Check if we already showed it
    const hasSeenPopup = localStorage.getItem("hasSeenSubscribePopup");
    
    // Only show if they haven't seen it and aren't already subscribed
    // 3 minutes = 180,000 ms. Setting to 180,000.
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 180000); 

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenSubscribePopup", "true");
  };

  const handleSubscribeClick = async (e: React.MouseEvent) => {
    if (!user) {
      // Allow it to go to /login naturally
      return;
    }
    
    e.preventDefault();
    if (isSubscribed) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ is_subscribed: true })
      .eq('id', user.id);
      
    if (!error) {
      setIsSubscribed(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
    setLoading(false);
  };

  if (!isVisible || isSubscribed) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 z-10 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
            Stay Updated!
          </h3>
          <p className="text-gray-600 mb-8 font-inter">
            Subscribe to our daily newsletter and never miss the breaking news, in-depth analysis, and top stories.
          </p>
          
          <Link
            href={user ? "#" : "/login"}
            onClick={handleSubscribeClick}
            className={`block w-full py-3 px-4 rounded-md text-white font-semibold text-lg transition-all shadow-lg ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 hover:shadow-red-500/30 hover:-translate-y-0.5"
            }`}
          >
            {loading ? "Wait..." : "Subscribe Now"}
          </Link>
          
          <button 
            onClick={handleClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            No thanks, I'll browse first
          </button>
        </div>
      </div>
    </div>
  );
}
