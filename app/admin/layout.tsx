import Link from "next/link";
import { LayoutDashboard, FileText, Settings, LogOut, Users, Megaphone, Inbox, BarChart2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import AdminMobileNav from "./AdminMobileNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Fetch current user role for conditional nav rendering
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isSuperAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isSuperAdmin = profile?.role === "super_admin";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <AdminMobileNav isSuperAdmin={isSuperAdmin} />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <Link href="/">
            <Image src="/bnblogo.png" alt="BNB Logo" width={120} height={48} className="object-contain h-8 w-auto mb-2" />
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Admin Panel</div>
          </Link>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <Link href="/admin" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <LayoutDashboard size={18} className="mr-3" /> Dashboard
          </Link>
          <Link href="/admin/insights" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <BarChart2 size={18} className="mr-3" /> Insights
          </Link>
          <Link href="/admin/articles/new" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
            <FileText size={18} className="mr-3" /> Post News
          </Link>
          {/* Users & Subscribers — visible to super_admin only */}
          {isSuperAdmin && (
            <Link href="/admin/users" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium">
              <Users size={18} className="mr-3" /> Users & Subscribers
            </Link>
          )}
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
        <div className="p-4 border-t border-gray-200 mt-auto">
          <Link href="/" className="flex items-center px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium">
            <LogOut size={18} className="mr-3" /> Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen md:h-auto">
        {children}
      </main>
    </div>
  );
}
