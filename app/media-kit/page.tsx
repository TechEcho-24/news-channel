import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Media Kit | Bharat News Bulletin",
  description: "Audience data, ad specifications, and partnership information for Bharat News Bulletin — India's independent digital newsroom.",
};

const ADS_EMAIL = "support@techecho.in";

export default function MediaKitPage() {
  return (
    <div style={{ background: "#FAFAFA" }}>

      {/* Hero */}
      <div style={{ background: "#111827", borderBottom: "1px solid #1f2937" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 24px 48px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>
            Media Kit · 2026
          </p>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "12px" }}>
            Bharat News Bulletin
          </h1>
          <p style={{ fontSize: "16px", color: "#9ca3af", maxWidth: "520px", lineHeight: 1.65 }}>
            Audience data, advertising specifications, and partnership information for brands and media buyers.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* About */}
        <section style={{ marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>The Publication</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", letterSpacing: "-0.01em", marginBottom: "24px" }}>About BNB</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", flexWrap: "wrap" }}>
            <div style={{ gridColumn: "1 / 2" }}>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.75, marginBottom: "14px" }}>
                <strong style={{ color: "#111827" }}>Bharat News Bulletin (BNB)</strong> is an independent English-language digital news publication based in India.
                We cover Business, Technology, Markets, Sports, Lifestyle, and more — with original reporting and analysis.
              </p>
              <p style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.75 }}>
                We do not answer to any political group, corporate house, or investor. This independence is why our audience trusts us.
              </p>
            </div>
            <div style={{ gridColumn: "2 / 3" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                  ["Founded", "2026"],
                  ["Language", "English"],
                  ["Geography", "India"],
                  ["Categories", "12+"],
                  ["Audience", "Growing"],
                  ["Ownership", "Independent"],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px" }}>
                    <div style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>{label}</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Audience */}
        <section style={{ marginBottom: "56px", borderTop: "1px solid #e5e7eb", paddingTop: "48px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Audience</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", letterSpacing: "-0.01em", marginBottom: "24px" }}>Who reads BNB</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {[
              ["Primary Age Range", "18–45 years"],
              ["Geography", "India (English-speaking)"],
              ["Reader Profile", "Professionals, students, entrepreneurs"],
              ["Reading Intent", "News-focused, not casual scrolling"],
            ].map(([label, value]) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
                <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>{label}</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Specs */}
        <section style={{ marginBottom: "56px", borderTop: "1px solid #e5e7eb", paddingTop: "48px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Specifications</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", letterSpacing: "-0.01em", marginBottom: "24px" }}>Ad Formats & Rates</h2>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Format", "Dimensions", "File Types", "Placement", "Rate"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Leaderboard", "728 × 90 px", "JPG, PNG, WebP", "Article top", "₹3,500 /mo"],
                  ["Sidebar Box", "300 × 250 px", "JPG, PNG, WebP", "Article sidebar", "₹1,500 /mo"],
                  ["In-Article", "300 × 250 px", "JPG, PNG, WebP", "Mid-article", "₹2,000 /mo"],
                  ["Homepage Hero", "970 × 250 px", "JPG, PNG, WebP", "Homepage top", "₹5,000 /mo"],
                  ["Sponsored Article", "Full article", "Copy + Images", "Permanent", "₹2,000 /article"],
                ].map((row, i) => (
                  <tr key={row[0]} style={{ borderBottom: i < 4 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#111827" }}>{row[0]}</td>
                    <td style={{ padding: "14px 16px", color: "#4b5563", fontFamily: "monospace", fontSize: "12px" }}>{row[1]}</td>
                    <td style={{ padding: "14px 16px", color: "#4b5563", fontFamily: "monospace", fontSize: "12px" }}>{row[2]}</td>
                    <td style={{ padding: "14px 16px", color: "#4b5563" }}>{row[3]}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#2563EB" }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Content Policy */}
        <section style={{ marginBottom: "56px", borderTop: "1px solid #e5e7eb", paddingTop: "48px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Policy</p>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", letterSpacing: "-0.01em", marginBottom: "16px" }}>What we don't accept</h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>All ads are reviewed before going live. We reject:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
            {[
              "Misleading or false claims",
              "Adult or age-restricted content",
              "Political campaign advertisements",
              "Animated or auto-playing media",
              "Ads that imitate editorial content without clear labelling",
              "Products or services illegal under Indian law",
            ].map(rule => (
              <div key={rule} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#374151" }}>
                <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>✕</span>
                {rule}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
          borderRadius: "16px", padding: "40px 36px",
          display: "flex", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between", gap: "24px",
        }}>
          <div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Ready to advertise with BNB?</h3>
            <p style={{ fontSize: "14px", color: "#93c5fd" }}>Email our team for a personalised package. We respond within 24 hours.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href={`mailto:${ADS_EMAIL}`} style={{ display: "inline-flex", alignItems: "center", background: "#fff", color: "#1d4ed8", fontWeight: 700, fontSize: "14px", padding: "12px 24px", borderRadius: "8px", textDecoration: "none" }}>
              {ADS_EMAIL}
            </a>
            <Link href="/advertise" style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: 700, fontSize: "14px", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)" }}>
              View Packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
