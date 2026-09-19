import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Bharat News Bulletin (BNB)",
  description:
    "Bharat News Bulletin (BNB) is an independent digital newsroom committed to honest, fearless journalism for India.",
};

const stats = [
  { value: "12+", label: "Topics Covered Daily" },
  { value: "100%", label: "Independently Owned" },
  { value: "0", label: "Political Affiliations" },
  { value: "2026", label: "Year Founded" },
];

const values = [
  {
    icon: "🎯",
    title: "Accuracy First",
    desc: "We verify every fact before publishing. If we get something wrong, we correct it — publicly and promptly. No excuses.",
  },
  {
    icon: "🔍",
    title: "Radical Clarity",
    desc: "Jargon slows readers down. We write so that anyone can understand complex stories without needing a dictionary.",
  },
  {
    icon: "🛡️",
    title: "True Independence",
    desc: "No advertiser, investor, or political party influences what we report. Our newsroom belongs to no one but the truth.",
  },
  {
    icon: "⚡",
    title: "Speed + Depth",
    desc: "We break news fast but never sacrifice depth. Every story gets the context and analysis it deserves.",
  },
  {
    icon: "🌐",
    title: "India-First Lens",
    desc: "From village courts to global boardrooms, we view every story through the lens of what it means for Bharat.",
  },
  {
    icon: "🤝",
    title: "Reader Trust",
    desc: "Our readers are our owners. We are accountable to them — and them alone. Their trust is the only currency we value.",
  },
];

const topics = [
  "India", "World", "Business", "Technology",
  "Startups", "Markets", "Sports", "Lifestyle",
  "Entertainment", "Automobile", "Reviews",
];

export default function AboutPage() {
  return (
    <>
      <style>{`
        .bnb-value-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 32px;
          transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
          cursor: default;
        }
        .bnb-value-card:hover {
          box-shadow: 0 8px 32px rgba(37,99,235,0.12);
          transform: translateY(-4px);
          border-color: #bfdbfe;
        }
        .bnb-topic-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 22px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          transition: all 0.18s;
        }
        .bnb-topic-pill:hover {
          background: #2563EB;
          color: #ffffff;
          border-color: #2563EB;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37,99,235,0.25);
        }
        .bnb-cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #1d4ed8;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 28px;
          border-radius: 10px;
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .bnb-cta-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .bnb-cta-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.1);
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 28px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.25);
          text-decoration: none;
          transition: background 0.18s;
        }
        .bnb-cta-btn-ghost:hover {
          background: rgba(255,255,255,0.18);
        }
      `}</style>

      <div className="bg-[#FAFAFA]">

        {/* ── HERO ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0f1f40 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Grid pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
          {/* Blue radial glow */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80%",
              height: "60%",
              background: "radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "100px 24px 80px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.4)",
                borderRadius: "100px",
                padding: "6px 18px",
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  color: "#93c5fd",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Est. 2026 · India
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(36px, 6vw, 68px)",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                marginBottom: "28px",
                letterSpacing: "-0.02em",
              }}
            >
              We report the stories<br />
              <span style={{ color: "#2563EB" }}>that need to be told.</span>
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "#9ca3af",
                lineHeight: 1.75,
                maxWidth: "600px",
                marginBottom: "48px",
              }}
            >
              Bharat News Bulletin (BNB) is an independent digital newsroom built on one belief:
              people deserve honest, clear, and fearless journalism — free from corporate or political pressure.
            </p>

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  style={{
                    padding: "32px 24px",
                    background: "rgba(255,255,255,0.03)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "42px",
                      fontWeight: 800,
                      color: "#ffffff",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MISSION ── */}
        <section style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 24px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#2563EB",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Our Mission
            </p>
            <blockquote
              style={{
                fontSize: "clamp(22px, 3.5vw, 34px)",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.4,
                borderLeft: "4px solid #2563EB",
                paddingLeft: "28px",
                margin: "0",
              }}
            >
              &ldquo;In a media landscape crowded with noise and bias, BNB exists to be the calm,
              clear signal. We don&apos;t chase clicks. We chase truth.&rdquo;
            </blockquote>
            <p
              style={{
                marginTop: "20px",
                color: "#6b7280",
                fontSize: "14px",
                paddingLeft: "32px",
              }}
            >
              — The BNB Editorial Team
            </p>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>
            <div style={{ marginBottom: "48px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#2563EB",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                What We Stand For
              </p>
              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: 800,
                  color: "#111827",
                  letterSpacing: "-0.02em",
                }}
              >
                The principles that guide every story.
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {values.map(({ icon, title, desc }) => (
                <div key={title} className="bnb-value-card">
                  <div
                    style={{
                      fontSize: "26px",
                      marginBottom: "16px",
                      width: "52px",
                      height: "52px",
                      background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.05) 100%)",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: "10px",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COVERAGE ── */}
        <section style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 24px" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "20px",
                marginBottom: "40px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#2563EB",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Our Coverage
                </p>
                <h2
                  style={{
                    fontSize: "clamp(22px, 2.5vw, 32px)",
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                  }}
                >
                  What We Cover
                </h2>
              </div>
              <p style={{ fontSize: "14px", color: "#6b7280", maxWidth: "380px" }}>
                From breaking headlines to deep-dives — across 12+ verticals that matter to India.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {topics.map((topic) => (
                <Link key={topic} href={`/${topic.toLowerCase()}`} className="bnb-topic-pill">
                  {topic}
                  <span style={{ fontSize: "14px", opacity: 0.5 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "80px 24px",
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "32px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 38px)",
                  fontWeight: 800,
                  color: "#ffffff",
                  marginBottom: "12px",
                  letterSpacing: "-0.02em",
                }}
              >
                Have a story for us?
              </h2>
              <p style={{ fontSize: "16px", color: "#93c5fd", maxWidth: "440px", lineHeight: 1.65 }}>
                Tips, corrections, partnership ideas — we read every message.
                Your insight could be tomorrow&apos;s front page.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/contact" className="bnb-cta-btn-primary">
                Contact Us →
              </Link>
              <Link href="/advertise" className="bnb-cta-btn-ghost">
                Advertise with BNB
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
