"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, User, Shield, Key } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", password: "", role: "reader" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage reporters, authors, and admins.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center">
          <UserPlus size={18} className="mr-2" />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white">
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Author</option>
              <option>Reader</option>
            </select>
          </div>
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
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading users...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                      {user.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.full_name || "Unknown User"}</div>
                      <div className="text-xs text-gray-500">{user.id.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'author' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role === 'super_admin' && <Shield size={12} className="mr-1" />}
                    {user.role === 'author' && <User size={12} className="mr-1" />}
                    {user.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-blue-600 p-2 transition-colors" title="Change Password / Edit">
                    <Key size={16} />
                  </button>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && !loading && (
              <tr><td colSpan={4} className="py-8 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

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
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
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
  );
}
