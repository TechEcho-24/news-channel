import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise | Bharat News Bulletin",
  description: "Put your brand in front of engaged Indian readers. Direct, transparent advertising with Bharat News Bulletin.",
};

const ADS_EMAIL = "support@techecho.in";

const packages = [
  {
    name: "Sidebar Banner",
    price: "₹1,500",
    period: "/month",
    slot: "300 × 250 px",
    features: [
      "Sidebar placement on all articles",
      "Click-through to your website",
      "Start & end date control",
      "JPG / PNG accepted",
    ],
    highlight: false,
  },
  {
    name: "Leaderboard",
    price: "₹3,500",
    period: "/month",
    slot: "728 × 90 px",
    features: [
      "Top-of-page on every article",
      "Maximum visibility",
      "Click-through to your website",
      "Priority placement",
      "Monthly performance report",
    ],
    highlight: true,
  },
  {
    name: "Sponsored Article",
    price: "₹2,000",
    period: "/article",
    slot: "Full Article",
    features: [
      "Written by the BNB team",
      "Permanent on our website",
      "Shared on BNB social media",
      "SEO benefit for your brand",
    ],
    highlight: false,
  },
];

const steps = [
  { num: "01", title: "Email us", desc: "Tell us which slot you want and for how long." },
  { num: "02", title: "Send your creative", desc: "We accept JPG / PNG. No animations or misleading content." },
  { num: "03", title: "Review & publish", desc: "We review the ad and make it live within 24 hours." },
  { num: "04", title: "That's it", desc: "Your ad runs for the agreed period. Renew any time." },
];

export default function AdvertisePage() {
  return (
    <>
      <style>{`
        .ad-card {
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          padding: 32px;
          display: flex;
          flex-direction: column;
          background: #fff;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .ad-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .ad-card.highlight { border-color: #2563EB; box-shadow: 0 4px 24px rgba(37,99,235,0.12); }
        .step-box { padding: 24px; background: #f9fafb; border-radius: 12px; }
        .step-num { font-size: 36px; font-weight: 800; color: #e5e7eb; font-variant-numeric: tabular-nums; margin-bottom: 8px; }
      `}</style>

      <div style={{ background: "#FAFAFA" }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #111827 0%, #1e3a5f 100%)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 24px 60px", position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "14px" }}>
              Advertising · Bharat News Bulletin
            </p>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "20px", lineHeight: 1.1 }}>
              Reach readers who<br />
              <span style={{ color: "#60a5fa" }}>actually care.</span>
            </h1>
            <p style={{ fontSize: "17px", color: "#9ca3af", maxWidth: "560px", lineHeight: 1.7, marginBottom: "36px" }}>
              BNB readers come here intentionally — for news, not entertainment. That intent makes them a more valuable audience for your brand.
            </p>
            <a
              href={`mailto:${ADS_EMAIL}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: "15px",
                padding: "14px 28px", borderRadius: "10px", textDecoration: "none",
              }}
            >
              Email us → {ADS_EMAIL}
            </a>
          </div>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "64px 24px 80px" }}>

          {/* Why direct ads */}
          <section style={{ marginBottom: "64px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Why BNB
            </p>
            <h2 style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", marginBottom: "32px" }}>
              Direct advertising. No middlemen.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {[
                ["No bidding wars", "Fixed pricing — you know exactly what you pay before you commit."],
                ["No algorithms", "Your ad appears as booked, every time. No surprises."],
                ["Real humans", "You deal directly with our team — not an automated dashboard."],
                ["Local focus", "We prioritise Indian businesses and community brands."],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>{title}</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.65 }}>{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Packages */}
          <section style={{ marginBottom: "64px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Packages
            </p>
            <h2 style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", marginBottom: "32px" }}>
              Pick a slot that fits your budget.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {packages.map(({ name, price, period, slot, features, highlight }) => (
                <div key={name} className={`ad-card${highlight ? " highlight" : ""}`}>
                  {highlight && (
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
                      ★ Most Popular
                    </div>
                  )}
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{name}</h3>
                  <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "20px" }}>{slot}</div>
                  <div style={{ marginBottom: "24px" }}>
                    <span style={{ fontSize: "38px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>{price}</span>
                    <span style={{ fontSize: "13px", color: "#9ca3af", marginLeft: "4px" }}>{period}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", flex: 1 }}>
                    {features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px", color: "#374151", marginBottom: "8px" }}>
                        <span style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`mailto:${ADS_EMAIL}?subject=Enquiry: ${name}`}
                    style={{
                      display: "block", textAlign: "center", padding: "12px",
                      borderRadius: "8px", fontWeight: 700, fontSize: "14px",
                      textDecoration: "none", transition: "opacity 0.15s",
                      background: highlight ? "#2563EB" : "#f3f4f6",
                      color: highlight ? "#fff" : "#374151",
                      border: highlight ? "none" : "1px solid #e5e7eb",
                    }}
                  >
                    Book this slot
                  </a>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}>
              Custom packages and long-term discounts available. Email us to discuss.
            </p>
          </section>

          {/* How it works */}
          <section style={{ marginBottom: "64px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Process
            </p>
            <h2 style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", marginBottom: "28px" }}>
              How it works
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {steps.map(({ num, title, desc }) => (
                <div key={num} className="step-box">
                  <div className="step-num">{num}</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>{title}</div>
                  <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div style={{
            background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
            borderRadius: "16px", padding: "48px 40px",
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between", gap: "24px",
          }}>
            <div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Ready to advertise?</h3>
              <p style={{ fontSize: "15px", color: "#93c5fd" }}>No long contracts to start. Email us and we'll get back within 24 hours.</p>
            </div>
            <a
              href={`mailto:${ADS_EMAIL}`}
              style={{
                display: "inline-flex", alignItems: "center",
                background: "#fff", color: "#1d4ed8", fontWeight: 700,
                fontSize: "15px", padding: "14px 28px", borderRadius: "10px",
                textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              {ADS_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
