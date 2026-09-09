"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const SUBJECTS = [
  "General Enquiry",
  "News Tip / Story Idea",
  "Advertise with Us",
  "Correction Request",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase.from("contact_messages").insert(form);
    setStatus(error ? "error" : "success");
    if (!error) setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  };

  return (
    <div className="bg-white">

      {/* Header — editorial strip style */}
      <div className="border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Bharat News Bulletin (BNB) · Contact</p>
          <h1 className="text-5xl font-serif font-bold text-gray-900">Get in Touch</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 grid md:grid-cols-5 gap-16">

        {/* Left column */}
        <div className="md:col-span-2 space-y-10">
          <div>
            <p className="text-gray-700 leading-relaxed text-base">
              We read every message. Whether it's a story tip, an ad enquiry, or just a thought — write to us and we'll get back to you.
            </p>
          </div>

          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">General</div>
              <a href="mailto:hello@bharatnewsbulletin.com" className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
                hello@bharatnewsbulletin.com
              </a>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Advertising</div>
              <a href="mailto:ads@bharatnewsbulletin.com" className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
                ads@bharatnewsbulletin.com
              </a>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Response Time</div>
              <p className="text-gray-900 font-medium">Within 24–48 hours</p>
              <p className="text-gray-500 text-sm">Mon – Sat</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 text-sm font-medium">Story tip?</p>
            <p className="text-yellow-700 text-xs mt-1 leading-relaxed">
              Select "News Tip / Story Idea" in the form. We protect our sources and take all tips seriously.
            </p>
          </div>
        </div>

        {/* Right column — form */}
        <div className="md:col-span-3">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CheckCircle size={48} className="text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Message received.</h3>
              <p className="text-gray-500 mb-6 text-sm">We'll reply within 24–48 hours.</p>
              <button onClick={() => setStatus("idle")} className="text-blue-600 text-sm hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === "error" && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 text-red-700 text-sm">
                  Something went wrong. Email us directly at hello@bharatnewsbulletin.com
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Name *</label>
                  <input required type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border-b-2 border-gray-300 focus:border-blue-600 py-2 text-sm outline-none transition-colors bg-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email *</label>
                  <input required type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border-b-2 border-gray-300 focus:border-blue-600 py-2 text-sm outline-none transition-colors bg-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Subject *</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full border-b-2 border-gray-300 focus:border-blue-600 py-2 text-sm outline-none bg-transparent transition-colors">
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Message *</label>
                <textarea required rows={6} value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full border-b-2 border-gray-300 focus:border-blue-600 py-2 text-sm outline-none resize-none bg-transparent transition-colors"
                  placeholder="Write your message here..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  By submitting, you agree to our{" "}
                  <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
                </p>
                <button type="submit" disabled={status === "loading"}
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 text-sm disabled:opacity-50 transition-colors">
                  {status === "loading" ? <><Loader2 size={16} className="animate-spin" /> Sending</> : <><Send size={16} /> Send Message</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
