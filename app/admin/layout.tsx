import Link from "next/link";
import { LayoutDashboard, FileText, Settings, LogOut, Users, Megaphone, Inbox, BarChart2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6 border-b border-gray-200">
          <div className="text-sm font-bold text-gray-600 uppercase tracking-widest">Admin Panel</div>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <LayoutDashboard size={18} className="mr-3" /> Dashboard
          </Link>
          <Link href="/admin/insights" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <BarChart2 size={18} className="mr-3" /> Insights
          </Link>
          <Link href="/admin/articles/new" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <FileText size={18} className="mr-3" /> Post News
          </Link>
          <Link href="/admin/users" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <Users size={18} className="mr-3" /> Users
          </Link>
          <Link href="/admin/ads" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <Megaphone size={18} className="mr-3" /> Ads
          </Link>
          <Link href="/admin/inbox" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <Inbox size={18} className="mr-3" /> Inbox
          </Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <Settings size={18} className="mr-3" /> Settings
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <Link href="/" className="flex items-center px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium">
            <LogOut size={18} className="mr-3" /> Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
