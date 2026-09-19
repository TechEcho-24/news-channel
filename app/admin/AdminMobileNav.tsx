"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, LogOut, Users, Megaphone, Inbox, BarChart2, Menu, X } from "lucide-react";
import Image from "next/image";

interface AdminMobileNavProps {
  isSuperAdmin: boolean;
}

export default function AdminMobileNav({ isSuperAdmin }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Mobile Top Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
        <Link href="/" className="flex items-center" onClick={closeMenu}>
          <Image src="/bnblogo.png" alt="BNB Logo" width={80} height={32} className="object-contain h-6 w-auto" />
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[57px] z-50 bg-white overflow-y-auto border-t border-gray-100 flex flex-col h-[calc(100vh-57px)] shadow-xl">
          <nav className="p-4 space-y-2 flex-1">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-4">Admin Panel</div>
            
            <Link onClick={closeMenu} href="/admin" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${pathname === '/admin' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <LayoutDashboard size={18} className="mr-3" /> Dashboard
            </Link>
            <Link onClick={closeMenu} href="/admin/insights" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${pathname?.includes('/insights') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <BarChart2 size={18} className="mr-3" /> Insights
            </Link>
            <Link onClick={closeMenu} href="/admin/articles/new" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${pathname?.includes('/articles/new') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <FileText size={18} className="mr-3" /> Post News
            </Link>
            
            {isSuperAdmin && (
              <Link onClick={closeMenu} href="/admin/users" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${pathname?.includes('/users') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                <Users size={18} className="mr-3" /> Users & Subscribers
              </Link>
            )}
            
            <Link onClick={closeMenu} href="/admin/ads" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${pathname?.includes('/ads') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <Megaphone size={18} className="mr-3" /> Ads
            </Link>
            <Link onClick={closeMenu} href="/admin/inbox" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${pathname?.includes('/inbox') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <Inbox size={18} className="mr-3" /> Inbox
            </Link>
            <Link onClick={closeMenu} href="/admin/settings" className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${pathname?.includes('/settings') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <Settings size={18} className="mr-3" /> Settings
            </Link>
          </nav>
          
          <div className="p-4 border-t border-gray-200 mt-auto bg-gray-50">
            <Link href="/" className="flex items-center px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium">
              <LogOut size={18} className="mr-3" /> Back to Website
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
