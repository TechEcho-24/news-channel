"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check cookie for existing language preference
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match && match[2]) {
      const lang = match[2].split('/')[2];
      if (['en', 'hi', 'de', 'ta', 'te'].includes(lang)) {
        setCurrentLang(lang);
      }
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    setIsOpen(false);
    
    // Google Translate cookie format: /auto/lang or /en/hi
    if (lang === 'en') {
      document.cookie = "googtrans=/en/en; path=/";
      document.cookie = "googtrans=/en/en; path=/; domain=" + location.hostname;
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=` + location.hostname;
    }
    
    // Reload to apply translation
    window.location.reload();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-8 md:h-10 px-2 md:px-3 text-gray-700 dark:text-gray-300 hover:text-[#472066] dark:hover:text-[#a074c4] transition-colors bg-transparent space-x-1"
        title="Change Language"
      >
        <span className="text-xs md:text-sm font-bold font-inter uppercase">{currentLang.slice(0, 3)}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg overflow-hidden z-[100] font-inter">
          <button 
            onClick={() => changeLanguage('en')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLang === 'en' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            English
          </button>
          <button 
            onClick={() => changeLanguage('hi')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLang === 'hi' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            हिंदी (Hindi)
          </button>
          <button 
            onClick={() => changeLanguage('de')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLang === 'de' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            Deutsch (German)
          </button>
          <button 
            onClick={() => changeLanguage('ta')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLang === 'ta' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            தமிழ் (Tamil)
          </button>
          <button 
            onClick={() => changeLanguage('te')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLang === 'te' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            తెలుగు (Telugu)
          </button>
        </div>
      )}
      
      {/* Hidden div required by Google Translate API to initialize */}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
}
