"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const EMAIL = "support@techecho.in";

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
    <>
      <style>{`
        .c-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #d1d5db;
          padding: 10px 0;
          font-size: 15px;
          color: #111827;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .c-input:focus { border-color: #111827; }
        .c-input::placeholder { color: #9ca3af; }
      `}</style>

      <div style={{ background: "#fff", minHeight: "80vh" }}>

        {/* Top border accent */}
        <div style={{ height: "3px", background: "#111827" }} />

        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "64px 24px 96px" }}>

          {/* Header */}
          <div style={{ marginBottom: "64px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "14px" }}>
              Contact
            </p>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "20px" }}>
              Get in touch.
            </h1>
            <p style={{ fontSize: "16px", color: "#6b7280", lineHeight: 1.7, maxWidth: "420px" }}>
              We read every message. Write to us at{" "}
              <a href={`mailto:${EMAIL}`} style={{ color: "#111827", fontWeight: 600, textDecoration: "underline" }}>
                {EMAIL}
              </a>
              {" "}or use the form below.
            </p>
          </div>

          {/* Two column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "80px", alignItems: "start" }}>

            {/* Left — info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
              {[
                { label: "General", value: EMAIL, href: `mailto:${EMAIL}` },
                { label: "Advertising", value: EMAIL, href: `mailto:${EMAIL}?subject=Advertising%20Enquiry` },
                { label: "Response time", value: "24–48 hrs", href: null },
              ].map(({ label, value, href }) => (
                <div key={label}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
                    {label}
                  </div>
                  {href ? (
                    <a href={href} style={{ fontSize: "15px", color: "#111827", fontWeight: 500, textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {value}
                    </a>
                  ) : (
                    <div style={{ fontSize: "15px", color: "#111827", fontWeight: 500 }}>{value}</div>
                  )}
                </div>
              ))}

              <div style={{ paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "14px" }}>
                  Follow us
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  {/* LinkedIn */}
                  <a href="https://www.linkedin.com/company/bharat-news-bulletin/" target="_blank" rel="noreferrer" title="LinkedIn"
                    style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e5e7eb", borderRadius: "8px", color: "#374151", transition: "border-color 0.18s, color 0.18s", textDecoration: "none" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#0077b5"; e.currentTarget.style.color = "#0077b5"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  {/* Instagram */}
                  <a href="https://www.instagram.com/bharatnewsbulletin/" target="_blank" rel="noreferrer" title="Instagram"
                    style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e5e7eb", borderRadius: "8px", color: "#374151", transition: "border-color 0.18s, color 0.18s", textDecoration: "none" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#e1306c"; e.currentTarget.style.color = "#e1306c"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  {/* Facebook */}
                  <a href="https://www.facebook.com/profile.php?id=61594250281793" target="_blank" rel="noreferrer" title="Facebook"
                    style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #e5e7eb", borderRadius: "8px", color: "#374151", transition: "border-color 0.18s, color 0.18s", textDecoration: "none" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#1877f2"; e.currentTarget.style.color = "#1877f2"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div>
              {status === "success" ? (
                <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <CheckCircle size={36} color="#16a34a" strokeWidth={1.5} />
                  <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>Message sent.</h3>
                  <p style={{ fontSize: "14px", color: "#6b7280" }}>We'll reply within 24–48 hours.</p>
                  <button onClick={() => setStatus("idle")} style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, textDecoration: "underline" }}>
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  {status === "error" && (
                    <p style={{ fontSize: "13px", color: "#dc2626" }}>
                      Something went wrong. Email us at <a href={`mailto:${EMAIL}`} style={{ fontWeight: 700 }}>{EMAIL}</a>
                    </p>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>Name</label>
                      <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="c-input" placeholder="Your name" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>Email</label>
                      <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="c-input" placeholder="you@example.com" />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>Subject</label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="c-input" style={{ cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="c-input" placeholder="Write your message…" style={{ resize: "none", lineHeight: 1.65 }} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                    <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Agree to our <Link href="/privacy" style={{ color: "#6b7280", textDecoration: "underline" }}>Privacy Policy</Link>
                    </p>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "#111827", color: "#fff",
                        fontWeight: 700, fontSize: "14px",
                        padding: "12px 28px", borderRadius: "6px",
                        border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
                        opacity: status === "loading" ? 0.6 : 1,
                        transition: "opacity 0.15s",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {status === "loading" ? <><Loader2 size={15} className="animate-spin" /> Sending</> : "Send message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
