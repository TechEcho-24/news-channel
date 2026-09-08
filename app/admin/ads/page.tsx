"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink, Loader2, Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Ad, AdSlotType } from "@/lib/ads";

const SLOT_LABELS: Record<AdSlotType, string> = {
  leaderboard: "Leaderboard (728×90) — Article Top & Homepage Between",
  sidebar: "Sidebar Box (300×250) — Article Side",
  in_article: "In-Article (300×250) — Article Middle",
  homepage_hero: "Homepage Hero Banner (970×250) — Top Premium",
  footer: "Footer Banner (728×90) — Bottom",
  nav_top: "Top Navbar Banner (970×90)",
};

const SLOT_COLORS: Record<AdSlotType, string> = {
  leaderboard: "bg-blue-100 text-blue-800",
  sidebar: "bg-purple-100 text-purple-800",
  in_article: "bg-orange-100 text-orange-800",
  homepage_hero: "bg-green-100 text-green-800",
  footer: "bg-gray-100 text-gray-800",
  nav_top: "bg-indigo-100 text-indigo-800",
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
      // If cta_text column doesn't exist yet in DB, retry without cta_text
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

  async function deleteAd(id: string) {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    await supabase.from("ads").delete().eq("id", id);
    setAds(ads.filter(a => a.id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ad Manager</h1>
          <p className="text-gray-500 mt-1">Manage your direct advertising banners & placements.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          New Ad
        </button>
      </div>

      {/* Create Ad Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold mb-5 text-gray-900">Add New Advertisement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Title (Internal)</label>
              <input
                required value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Summer Promo Campaign"
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
              <img src={form.image_url} alt="preview" className="max-h-24 border border-gray-200 rounded" />
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

      {/* Ads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5">Ad</th>
              <th className="py-3 px-5">Slot</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Duration</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">
                <Loader2 className="animate-spin inline mr-2" size={18} /> Loading ads...
              </td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">
                No ads yet. Click "New Ad" to add your first advertisement.
              </td></tr>
            ) : ads.map(ad => (
              <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ad.image_url} alt={ad.title} className="w-16 h-10 object-cover rounded border border-gray-200" />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{ad.title}</div>
                      <a href={ad.link_url} target="_blank" rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                        {ad.link_url.replace("https://", "").substring(0, 30)}... <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SLOT_COLORS[ad.slot]}`}>
                    {ad.slot.replace("_", " ")}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <button onClick={() => toggleActive(ad)} className="flex items-center gap-2 text-sm font-medium">
                    {ad.is_active ? (
                      <><ToggleRight size={22} className="text-green-500" /><span className="text-green-600">Active</span></>
                    ) : (
                      <><ToggleLeft size={22} className="text-gray-400" /><span className="text-gray-500">Paused</span></>
                    )}
                  </button>
                </td>
                <td className="py-4 px-5 text-xs text-gray-500">
                  {ad.starts_at ? new Date(ad.starts_at).toLocaleDateString("en-IN") : "Anytime"}
                  {" → "}
                  {ad.ends_at ? new Date(ad.ends_at).toLocaleDateString("en-IN") : "No expiry"}
                </td>
                <td className="py-4 px-5 text-right">
                  <button onClick={() => deleteAd(ad.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
