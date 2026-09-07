"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Shield, LogOut, Loader2, Save, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (userProfile) {
        setProfile(userProfile);
        setFullName(userProfile.full_name || "");
      }
      setLoading(false);
    }
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      setError("Could not save changes. Please try again.");
    } else {
      setProfile({ ...profile, full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayInitial = fullName
    ? fullName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  const displayName = fullName || user?.email || "Reader";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl px-8 py-10 text-white flex items-center gap-6 shadow-lg">
          <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/40 flex-shrink-0">
            {displayInitial}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-blue-100 text-sm mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
              {profile?.role?.replace("_", " ") || "Reader"}
            </span>
          </div>
          {(profile?.role === "super_admin" || profile?.role === "author") && (
            <div className="ml-auto">
              <Link
                href="/admin"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Shield size={16} />
                Admin Panel
              </Link>
            </div>
          )}
        </div>

        {/* Profile Settings Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update how you appear when commenting.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your display name"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                This name shows up when you comment. Leave blank to show your email instead.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative opacity-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="block w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} />
                  Saved!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Sign Out Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Sign Out</h2>
            <p className="text-sm text-gray-500 mt-0.5">You will need to sign in again on your next visit.</p>
          </div>
          <div className="px-8 py-6">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
