"use client";

import Link from "next/link";
import { Search, Menu, X, ChevronDown, User, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { generateSlug } from "@/lib/api";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle Search Fetching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const fetchSearch = async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from('articles')
        .select('id, title, subheadline, cover_image, category, published_at')
        .ilike('title', `%${searchQuery}%`)
        .order('published_at', { ascending: false })
        .limit(4);
      if (data) setSearchResults(data);
      setIsSearching(false);
    };
    const timer = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, supabase]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function checkAuthAndSub() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data?.is_subscribed) {
          setIsSubscribed(true);
        }
        
        let nameToUse = data?.full_name || data?.username || user.user_metadata?.full_name || user.user_metadata?.name || user.email;
        if (nameToUse) {
           // Basic logic to get "AS" from "Anuj Sachan"
           const parts = nameToUse.split(/[\s_@.-]+/).filter(Boolean);
           if (parts.length >= 2) {
             setUserInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
           } else if (parts.length === 1) {
             setUserInitials(parts[0].substring(0, 2).toUpperCase());
           }
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
    <header className="border-b border-gray-200 sticky top-0 bg-white/70 backdrop-blur-md z-50">
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
              
              {/* Contact Link in Center Nav */}
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Bar Container */}
            <div className="relative hidden sm:block" ref={searchContainerRef}>
              {isSearchOpen ? (
                <div className="flex items-center border border-blue-600 rounded-full px-3 py-1.5 bg-white w-[250px] transition-all">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search news..." 
                    className="w-full bg-transparent outline-none text-sm font-inter"
                    autoFocus
                  />
                  <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-600 ml-1">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-700 hover:text-black transition-colors"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim() !== "" && (
                <div className="absolute top-full right-0 mt-3 w-[350px] bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-[100] font-inter">
                  <div className="p-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 flex justify-between items-center">
                    <span>SEARCH RESULTS</span>
                    {isSearching && <Loader2 size={14} className="animate-spin text-blue-600" />}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((article) => (
                        <Link 
                          key={article.id} 
                          href={`/${article.category.toLowerCase()}/${generateSlug(article.title)}`}
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                          className="flex items-start p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors gap-3"
                        >
                          <div className="w-16 h-12 relative flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                            {article.cover_image ? (
                               <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
                            ) : (
                               <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400">No Img</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate">{article.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{article.subheadline}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      !isSearching && (
                        <div className="p-6 text-center text-sm text-gray-500">
                          No articles found matching "{searchQuery}"
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
            
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
            <Link href="/profile" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors border-2 border-gray-300 rounded-full hover:border-blue-600 bg-gray-50 overflow-hidden font-bold text-xs md:text-sm">
              {userInitials ? (
                userInitials
              ) : (
                <User size={16} className="md:w-5 md:h-5" />
              )}
            </Link>
            <LanguageSelector />
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
