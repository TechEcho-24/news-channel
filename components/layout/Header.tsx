"use client";

import Link from "next/link";
import { Search, Menu, X, ChevronDown, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuthAndSub() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('is_subscribed').eq('id', user.id).single();
        if (data?.is_subscribed) {
          setIsSubscribed(true);
        }
      }
    }
    checkAuthAndSub();
  }, []);

  const handleSubscribeClick = async (e: React.MouseEvent) => {
    if (!user) {
      // Allow the Link to naturally redirect to /login if we change the href below
      return;
    }
    
    e.preventDefault();
    if (isSubscribed) return;

    setLoading(true);
    // In a real app, this would open a payment gateway. For now, just update DB.
    const { error } = await supabase
      .from('profiles')
      .update({ is_subscribed: true })
      .eq('id', user.id);
      
    if (!error) {
      setIsSubscribed(true);
    }
    setLoading(false);
  };

  const topCategories = ["Latest", "India", "World"];
  const dropdownCategories = [
    "Business",
    "Technology",
    "Startups",
    "Markets",
    "Automobile",
    "Entertainment",
    "Sports",
    "Lifestyle",
    "Reviews",
  ];

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-[#FAFAFA] z-50">
      <div className="w-full px-8">
        {/* Top Header */}
        <div className="flex justify-between items-center py-4">
          {/* Mobile Menu Icon */}
          <div className="lg:hidden">
            <button 
              className="p-2 text-gray-700 hover:text-black"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Logo */}
          <div className="text-4xl font-serif font-extrabold italic tracking-tighter text-center lg:text-left flex-1 lg:flex-none">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <span className="text-black">I</span><span className="text-red-600">N</span><span className="text-black">B</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 justify-center mx-8">
            <ul className="flex items-center space-x-6 text-sm font-semibold tracking-wide capitalize text-gray-700 font-inter">
              {topCategories.map((cat) => (
                <li key={cat}>
                  <Link href={`/${cat.toLowerCase()}`} className="hover:text-blue-600 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
              
              {/* Dropdown */}
              <li className="relative group cursor-pointer py-4">
                <span className="hover:text-blue-600 transition-colors flex items-center">
                  Categories <ChevronDown size={16} className="ml-1" />
                </span>
                
                <div className="absolute top-full left-0 w-48 bg-white border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <ul className="py-2">
                    {dropdownCategories.map((cat) => (
                      <li key={cat}>
                        <Link href={`/${cat.toLowerCase()}`} className="block px-4 py-2 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                          {cat}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 text-gray-700 hover:text-black hidden sm:block">
              <Search size={20} />
            </button>
            <Link
              href={user ? "#" : "/login"}
              onClick={handleSubscribeClick}
              className={`text-white text-xs md:text-sm font-semibold px-3 py-2 md:px-5 transition-colors shadow-sm ${
                isSubscribed 
                  ? "bg-green-600 cursor-default" 
                  : loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#DC2626] hover:bg-red-700"
              }`}
            >
              {isSubscribed ? "Subscribed" : loading ? "Wait..." : "Subscribe"}
            </Link>
            <Link href="/profile" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors border-2 border-gray-300 rounded-full hover:border-blue-600">
              <User size={16} className="md:w-5 md:h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[100] lg:hidden overflow-y-auto font-inter">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#FAFAFA]">
            <Link href="/" className="text-3xl font-serif font-extrabold italic tracking-tighter" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-black">I</span><span className="text-red-600">N</span><span className="text-black">B</span>
            </Link>
            <button 
              className="p-2 text-gray-700 hover:text-black"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={28} />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-6 relative">
              <input type="text" placeholder="Search news..." className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-600" />
              <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>

            <ul className="space-y-4 text-lg font-bold capitalize">
              {topCategories.map((cat) => (
                <li key={cat}>
                  <Link href={`/${cat.toLowerCase()}`} className="block pb-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                    {cat}
                  </Link>
                </li>
              ))}
              <li className="pt-4 pb-2 text-gray-400 text-sm tracking-wider">ALL CATEGORIES</li>
              {dropdownCategories.map((cat) => (
                <li key={cat}>
                  <Link href={`/${cat.toLowerCase()}`} className="block pb-2 border-b border-gray-100 text-gray-600 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
