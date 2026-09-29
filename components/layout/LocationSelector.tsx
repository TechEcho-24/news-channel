"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LocationSelector() {
  const [currentLoc, setCurrentLoc] = useState("India");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const changeLocation = (loc: string, path: string) => {
    setCurrentLoc(loc);
    setIsOpen(false);
    // As a placeholder, it just navigates to the category/location page
    router.push(path);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-8 md:h-10 px-2 md:px-3 text-gray-700 dark:text-gray-300 hover:text-[#472066] dark:hover:text-[#a074c4] transition-colors bg-transparent space-x-1"
        title="Change Location"
      >
        <MapPin size={14} />
        <span className="text-xs md:text-sm font-bold font-inter truncate max-w-[60px] md:max-w-none">{currentLoc}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg overflow-hidden z-[100] font-inter">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 uppercase tracking-wider">
            Countries
          </div>
          <button 
            onClick={() => changeLocation('India', '/india')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLoc === 'India' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            India
          </button>
          <button 
            onClick={() => changeLocation('World', '/world')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLoc === 'World' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            World
          </button>
          <button 
            onClick={() => changeLocation('USA', '/usa')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLoc === 'USA' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            United States
          </button>

          <div className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 uppercase tracking-wider">
            Cities (India)
          </div>
          <button 
            onClick={() => changeLocation('Delhi', '/delhi')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLoc === 'Delhi' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            Delhi
          </button>
          <button 
            onClick={() => changeLocation('Mumbai', '/mumbai')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLoc === 'Mumbai' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            Mumbai
          </button>
          <button 
            onClick={() => changeLocation('Bangalore', '/bangalore')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${currentLoc === 'Bangalore' ? 'font-bold text-[#472066] dark:text-[#a074c4] bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300'}`}
          >
            Bangalore
          </button>
        </div>
      )}
    </div>
  );
}
