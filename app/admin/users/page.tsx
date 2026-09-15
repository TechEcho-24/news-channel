"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Search, User, Shield, Key, Mail, MailCheck, Users, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function UsersManagementPage() {
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "subscribers">("subscribers");

  // ── Registered Users ──────────────────────────────────────────
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: "reader" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Newsletter Subscribers ─────────────────────────────────────
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subSearch, setSubSearch] = useState("");

  useEffect(() => {
    // Check current user role first
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role ?? "reader";
      setCurrentUserRole(role);
      setRoleLoading(false);

      // If not super_admin: redirect back to dashboard
      if (role !== "super_admin") {
        router.replace("/admin");
      } else {
        // super_admin defaults to users tab
        setActiveTab("users");
      }
    }
    checkRole();
    fetchUsers();
    fetchSubscribers();
  }, []);

  async function fetchUsers() {
    setUsersLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setUsers(data);
    setUsersLoading(false);
  }

  async function fetchSubscribers() {
    setSubsLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      if (res.ok) setSubscribers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch subscribers:", e);
    }
    setSubsLoading(false);
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      alert("User created successfully!");
      setIsModalOpen(false);
      setFormData({ full_name: "", email: "", password: "", role: "reader" });
      fetchUsers();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredSubs = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(subSearch.toLowerCase())
  );

  return (
    <>
    {/* While role is loading, show spinner — prevents content flash for non-admins */}
    {roleLoading ? (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    ) : currentUserRole !== "super_admin" ? null : (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users & Subscribers</h1>
          <p className="text-gray-500 mt-1">
            Registered users and newsletter subscribers in one place.
          </p>
        </div>
        {activeTab === "users" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
          >
            <UserPlus size={18} className="mr-2" />
            Add New User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "users"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users size={16} />
          Registered Users
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {users.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "subscribers"
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Mail size={16} />
          Newsletter Subscribers
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {subscribers.length}
          </span>
        </button>
      </div>

      {/* ── REGISTERED USERS TAB ── */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="author">Author</option>
              <option value="reader">Reader</option>
            </select>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold">
              <tr>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Joined</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No users found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                        {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.full_name || "Unknown User"}</div>
                        <div className="text-xs text-gray-400 font-mono">{user.id.substring(0, 12)}…</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${user.role === "super_admin" ? "bg-purple-100 text-purple-800" :
                        user.role === "author" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-700"}`}>
                      {user.role === "super_admin" && <Shield size={11} />}
                      {user.role === "author" && <User size={11} />}
                      {user.role?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-400 hover:text-blue-600 p-2 transition-colors" title="Change Password / Edit">
                      <Key size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── NEWSLETTER SUBSCRIBERS TAB ── */}
      {activeTab === "subscribers" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by email..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-64"
              />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Total: <span className="font-bold text-gray-800">{subscribers.length}</span>
            </p>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold">
              <tr>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Preferences</th>
                <th className="py-3 px-6">Subscribed On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subsLoading ? (
                <tr><td colSpan={3} className="py-8 text-center text-gray-500">Loading subscribers...</td></tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <MailCheck size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400 font-medium">No subscribers yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Newsletter subscriptions will appear here.</p>
                  </td>
                </tr>
              ) : filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold flex-shrink-0">
                        {sub.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{sub.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {(sub.preferences && sub.preferences.length > 0)
                        ? sub.preferences.map((pref: string) => (
                            <span key={pref} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">
                              {pref}
                            </span>
                          ))
                        : <span className="text-gray-400 text-xs">—</span>
                      }
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(sub.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6">Add New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="reader">Reader</option>
                  <option value="author">Author</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    )}
    </>
  );
}
