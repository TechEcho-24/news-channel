import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Bharat News Bulletin",
  description: "Read how Bharat News Bulletin collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "September 20, 2026";
const SITE_NAME = "Bharat News Bulletin";
const CONTACT_EMAIL = "support@techecho.in";
const SITE_URL = "bharatnewsbulletin.com";

export default function PrivacyPolicyPage() {
  return (
    <>
      <style>{`
        .policy-section h2 {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-top: 40px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f3f4f6;
        }
        .policy-section p, .policy-section li {
          font-size: 15px;
          color: #4b5563;
          line-height: 1.75;
        }
        .policy-section ul {
          padding-left: 20px;
          margin-top: 8px;
          list-style: disc;
          space-y: 6px;
        }
        .policy-section li { margin-bottom: 6px; }
        .policy-section a { color: #2563EB; text-decoration: underline; }
      `}</style>

      <div style={{ background: "#FAFAFA", minHeight: "60vh" }}>
        {/* Hero */}
        <div style={{ background: "#111827", borderBottom: "1px solid #1f2937" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 24px 48px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>
              Legal · Privacy
            </p>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "12px" }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Last updated: {LAST_UPDATED} &nbsp;·&nbsp; Applies to: {SITE_URL}
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>
          {/* Summary box */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "16px 20px", marginBottom: "8px" }}>
            <p style={{ fontSize: "14px", color: "#1d4ed8", margin: 0 }}>
              <strong>Plain-language summary:</strong> We collect only what is necessary to run this service. We do not sell your data. You can request deletion at any time by emailing us.
            </p>
          </div>

          <div className="policy-section">
            <h2>1. Who We Are</h2>
            <p>
              {SITE_NAME} ("we", "our", "us") operates the website at {SITE_URL} — an independent digital news publication based in India.
              For any privacy-related questions, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>

            <h2>2. What Data We Collect</h2>
            <ul>
              <li><strong>Account information:</strong> When you register, we collect your email address and optionally a display name.</li>
              <li><strong>Usage data:</strong> Pages visited, time spent, and device type — used solely to improve the service.</li>
              <li><strong>Contact messages:</strong> If you use our contact form, we store the message and the email you provide.</li>
              <li><strong>Cookies:</strong> We use essential session cookies to keep you logged in. We do not use third-party tracking cookies for advertising purposes.</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To create and maintain your account</li>
              <li>To send newsletters or updates you have opted into</li>
              <li>To respond to contact messages you send us</li>
              <li>To understand site performance and improve our content</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>4. Data Sharing</h2>
            <p>
              We do <strong>not</strong> sell, trade, or rent your personal data. Data may be shared only with:
            </p>
            <ul>
              <li>Infrastructure providers (e.g., database hosting) strictly for operating the service</li>
              <li>Law enforcement or government bodies when required by a valid legal obligation</li>
            </ul>

            <h2>5. Advertising</h2>
            <p>
              We run direct-placement banner advertisements from businesses. These ads do not track your browsing behaviour. If we enable a third-party ad network in the future, this policy will be updated and you will be notified.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              Account data is retained for as long as your account is active. You may request deletion of your account and all associated data at any time by emailing us.
            </p>

            <h2>7. Your Rights</h2>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>

            <h2>8. Security</h2>
            <p>
              We use encrypted data storage and HTTPS connections. No online transmission is 100% secure, but we take reasonable steps to protect your information.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              If we make material changes to this policy, we will update the "Last updated" date above. Continued use of the site after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* Footer links */}
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "28px", marginTop: "40px" }}>
            <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "12px" }}>
              Questions? Write to us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#2563EB" }}>{CONTACT_EMAIL}</a>
            </p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <Link href="/about" style={{ fontSize: "13px", color: "#2563EB", textDecoration: "underline" }}>About Us</Link>
              <Link href="/contact" style={{ fontSize: "13px", color: "#2563EB", textDecoration: "underline" }}>Contact</Link>
              <Link href="/advertise" style={{ fontSize: "13px", color: "#2563EB", textDecoration: "underline" }}>Advertise</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
