import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read The Echo's Privacy Policy to understand how we collect, use, and protect your personal information.",
};

const LAST_UPDATED = "September 8, 2026";
const SITE_NAME = "The Echo";
const CONTACT_EMAIL = "privacy@theecho.in";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Legal</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800">
            <strong>Summary:</strong> We respect your privacy. We collect only what we need to run our service, we don't sell your data, and you can request deletion at any time.
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Who We Are</h2>
            <p>
              {SITE_NAME} ("we", "our", or "us") is a digital news publication. This Privacy Policy explains how we handle your personal data when you visit our website or create an account.
            </p>
            <p className="mt-3">
              If you have questions, contact us at: <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. What Data We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Data:</strong> When you register, we collect your email address and optionally your display name.</li>
              <li><strong>Usage Data:</strong> We may log pages visited, time spent, and device type to improve our service.</li>
              <li><strong>Comments:</strong> If you post a comment, the text and your display name are stored.</li>
              <li><strong>Cookies:</strong> We use essential cookies to keep you logged in. We do not use tracking cookies for advertising (unless Google AdSense is active — see Section 5).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain your account</li>
              <li>To display your comments on articles</li>
              <li>To send you updates you have subscribed to</li>
              <li>To improve our website and editorial content</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Data Sharing</h2>
            <p>
              We do <strong>not</strong> sell, trade, or rent your personal data to third parties. We may share data only:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>With service providers who help us operate our website (e.g., Supabase for database hosting)</li>
              <li>When required by law or a valid legal request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Advertising</h2>
            <p>
              We display advertisements on our website. These may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Direct Ads:</strong> Banners placed by local businesses. These do not track you.</li>
              <li><strong>Google AdSense (when active):</strong> Google may use cookies to show personalised ads based on your browsing history. You can opt out at <a href="https://adssettings.google.com" className="text-blue-600 underline" target="_blank" rel="noreferrer">adssettings.google.com</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Comments are kept indefinitely as they are part of our editorial record. You may request deletion of your account and associated data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3">To exercise these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Security</h2>
            <p>
              We use industry-standard security measures including encrypted data storage and secure HTTPS connections. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of the website after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <div className="border-t border-gray-200 pt-8 mt-10 text-sm text-gray-500">
            <p>Questions? Contact us: <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">{CONTACT_EMAIL}</a></p>
            <div className="mt-4 flex gap-4">
              <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              <Link href="/about" className="text-blue-600 hover:underline">About Us</Link>
              <Link href="/contact" className="text-blue-600 hover:underline">Contact</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
