"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, ToggleLeft, ToggleRight, ExternalLink, Loader2, Upload, ChevronRight, BarChart2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Ad, AdSlotType } from "@/lib/ads";

const SLOT_LABELS: Record<AdSlotType, string> = {
  leaderboard: "Leaderboard (728×90) — Article Top & Footer",
  sidebar: "Sidebar Box (300×250) — Article Side",
  in_article: "In-Article (300×250) — Article Middle",
  homepage_hero: "Homepage Hero Banner (970×250) — Top Premium",
  category_banner: "Category Billboard (970×250) — Between Category Blocks",
  footer: "Footer Banner (728×90) — Bottom",
  nav_top: "Top Navbar Banner (970×90)",
  half_page: "Half Page Banner (300×600) — Article Sidebar Sticky",
};

const SLOT_COLORS: Record<AdSlotType, string> = {
  leaderboard: "bg-blue-100 text-blue-800",
  sidebar: "bg-purple-100 text-purple-800",
  in_article: "bg-orange-100 text-orange-800",
  homepage_hero: "bg-green-100 text-green-800",
  category_banner: "bg-teal-100 text-teal-800",
  footer: "bg-gray-100 text-gray-800",
  nav_top: "bg-indigo-100 text-indigo-800",
  half_page: "bg-rose-100 text-rose-800",
};

export default function AdsManagerPage() {
  const supabase = createClient();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    title: "",
    image_url: "",
    link_url: "",
    slot: "leaderboard" as AdSlotType,
    cta_text: "",
    starts_at: "",
    ends_at: "",
  });

  useEffect(() => { fetchAds(); }, []);

  async function fetchAds() {
    setLoading(true);
    const { data } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });
    setAds((data as Ad[]) || []);
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `ad_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("article_images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("article_images")
        .getPublicUrl(fileName);

      setForm(prev => ({ ...prev, image_url: publicUrlData.publicUrl }));
    } catch (err: any) {
      alert("Error uploading image: " + (err.message || "Failed to upload"));
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const startsAtIso = form.starts_at ? new Date(form.starts_at).toISOString() : null;
    const endsAtIso = form.ends_at ? new Date(form.ends_at).toISOString() : null;

    const payload: any = {
      title: form.title,
      image_url: form.image_url,
      link_url: form.link_url,
      slot: form.slot,
      is_active: true,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
    };
    if (form.cta_text) {
      payload.cta_text = form.cta_text;
    }

    const { error } = await supabase.from("ads").insert(payload);
    if (error) {
      if (error.message?.includes("cta_text")) {
        delete payload.cta_text;
        await supabase.from("ads").insert(payload);
      } else {
        alert("Error saving ad: " + error.message);
      }
    }

    setForm({ title: "", image_url: "", link_url: "", slot: "leaderboard", cta_text: "", starts_at: "", ends_at: "" });
    setShowForm(false);
    setSaving(false);
    fetchAds();
  }

  async function toggleActive(ad: Ad) {
    await supabase.from("ads").update({ is_active: !ad.is_active }).eq("id", ad.id);
    setAds(ads.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a));
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad Manager</h1>
          <p className="text-gray-500 mt-1">Manage advertising banners, slots, and active campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/insights"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <BarChart2 size={16} />
            Analytics Dashboard →
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            New Ad
          </button>
        </div>
      </div>

      {/* Create Ad Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold mb-5 text-gray-900">Add New Advertisement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Title / Vendor Name</label>
              <input
                required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. ABC Sweets - Festival Campaign"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Slot (Placement Location)</label>
              <select
                value={form.slot}
                onChange={e => setForm({ ...form, slot: e.target.value as AdSlotType })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(SLOT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Image URL & File Upload Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Image</label>
              <div className="flex gap-3 items-center">
                <input
                  required value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://... (image link) or upload file →"
                />
                <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                  {uploadingImage ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Upload size={16} />}
                  {uploadingImage ? "Uploading..." : "Upload File"}
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Click Destination URL</label>
              <input
                required value={form.link_url}
                onChange={e => setForm({ ...form, link_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://vendor-website.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Button Label (Optional)</label>
              <select
                value={form.cta_text}
                onChange={e => setForm({ ...form, cta_text: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (Image Only)</option>
                <option value="Shop Now">Shop Now</option>
                <option value="Learn More">Learn More</option>
                <option value="Get Offer">Get Offer</option>
                <option value="Buy Now">Buy Now</option>
                <option value="Subscribe">Subscribe</option>
                <option value="Book Now">Book Now</option>
                <option value="Contact Us">Contact Us</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date (optional)</label>
              <input
                type="datetime-local" value={form.starts_at}
                onChange={e => setForm({ ...form, starts_at: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date (optional)</label>
              <input
                type="datetime-local" value={form.ends_at}
                onChange={e => setForm({ ...form, ends_at: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {form.image_url && (
            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2 font-medium">Banner Preview:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image_url} alt="preview" className="max-h-24 border border-gray-200 rounded object-contain" />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving..." : "Save Ad"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Clean Ads Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6">Ad / Vendor Name</th>
              <th className="py-4 px-6">Slot Location</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Details & Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-gray-400">
                <Loader2 className="animate-spin inline mr-2" size={18} /> Loading ads...
              </td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-gray-400">
                No ads yet. Click "New Ad" to add your first advertisement.
              </td></tr>
            ) : ads.map(ad => {
              const href = ad.link_url.startsWith("http://") || ad.link_url.startsWith("https://") ? ad.link_url : `https://${ad.link_url}`;

              return (
                <tr
                  key={ad.id}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  onClick={() => window.location.href = `/admin/ads/${ad.id}`}
                >
                  {/* Image & Title & Link */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ad.image_url} alt={ad.title} className="w-16 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0 group-hover:scale-105 transition-transform" />
                      <div>
                        <div className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                          {ad.title}
                        </div>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-gray-400 hover:text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {href.replace("https://", "").replace("http://", "").substring(0, 30)}... <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Placement Slot Location */}
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${SLOT_COLORS[ad.slot] || "bg-gray-100 text-gray-800"}`}>
                      {ad.slot.replace("_", " ")}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleActive(ad)} className="flex items-center gap-1.5 text-xs font-semibold">
                      {ad.is_active ? (
                        <><ToggleRight size={20} className="text-green-500" /><span className="text-green-600 font-bold">Active</span></>
                      ) : (
                        <><ToggleLeft size={20} className="text-gray-400" /><span className="text-gray-500">Paused</span></>
                      )}
                    </button>
                  </td>

                  {/* Details Button -> Opens dedicated detail page */}
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/ads/${ad.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
