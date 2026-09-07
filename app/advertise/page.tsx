import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Advertise with The Echo",
  description: "Put your brand in front of thousands of engaged readers. Direct, transparent advertising with The Echo.",
};

export default function AdvertisePage() {
  return (
    <div className="bg-white">

      {/* Header */}
      <div className="border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">The Echo · Advertising</p>
          <h1 className="text-5xl font-serif font-bold text-gray-900">Work with Us</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-16">

        {/* Intro */}
        <section className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xl text-gray-700 leading-relaxed">
              The Echo reaches readers who care about what they read. No doomscrolling, no clickbait — just people who come here specifically for news.
            </p>
            <p className="text-gray-500 mt-4 leading-relaxed">
              That makes our audience unusually valuable for local businesses and brands who want real engagement, not just impressions.
            </p>
            <a href="mailto:ads@theecho.in" className="inline-block mt-8 bg-blue-600 text-white font-semibold px-7 py-3 text-sm hover:bg-blue-700 transition-colors">
              Email us to start → ads@theecho.in
            </a>
          </div>
          <div className="border border-gray-200 p-7 space-y-5">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-3">Why direct advertising?</div>
            {[
              ["No middlemen", "You pay us. We show your ad. Simple."],
              ["Fixed pricing", "No bidding wars. You know exactly what you pay."],
              ["Real humans", "Talk to a real person, not an automated dashboard."],
              ["Local focus", "We prioritise businesses from our community."],
            ].map(([title, desc]) => (
              <div key={title}>
                <div className="font-semibold text-gray-900 text-sm">{title}</div>
                <div className="text-gray-500 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Packages */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8 border-t border-gray-200 pt-8">Ad Packages</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "₹1,500",
                period: "/month",
                slot: "Sidebar Banner (300×250)",
                features: [
                  "Sidebar placement on all articles",
                  "Your brand seen by engaged readers",
                  "Click-through to your website",
                  "Start & end date control",
                ],
                cta: "Book Sidebar Ad",
                highlight: false,
              },
              {
                name: "Featured",
                price: "₹3,500",
                period: "/month",
                slot: "Leaderboard (728×90)",
                features: [
                  "Premium top-of-page placement",
                  "Maximum visibility on every article",
                  "Click-through to your website",
                  "Priority placement",
                  "Basic performance report",
                ],
                cta: "Book Featured Ad",
                highlight: true,
              },
              {
                name: "Sponsored Story",
                price: "₹2,000",
                period: "per article",
                slot: "Sponsored Article",
                features: [
                  "Full article written about your brand",
                  "Permanent on our website",
                  "Shared on our social media",
                  "SEO benefits for your brand",
                ],
                cta: "Book Sponsored Story",
                highlight: false,
              },
            ].map(({ name, price, period, slot, features, cta, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl border-2 p-7 flex flex-col ${
                  highlight ? "border-blue-600 shadow-lg shadow-blue-100" : "border-gray-200"
                }`}
              >
                {highlight && (
                  <div className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-3">Most Popular</div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                <div className="text-sm text-gray-500 mb-4">{slot}</div>
                <div className="mb-5">
                  <span className="text-4xl font-bold text-gray-900">{price}</span>
                  <span className="text-gray-500 text-sm">{period}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:ads@theecho.in?subject=${encodeURIComponent(cta)}`}
                  className={`w-full py-3 rounded-lg font-semibold text-center text-sm transition-colors ${
                    highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {cta}
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Prices are indicative. Custom packages and long-term discounts available — email us to discuss.</p>
        </section>


        {/* Process */}
        <section className="border-t border-gray-200 pt-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">How it Works</h2>
          <div className="grid md:grid-cols-4 gap-0 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {[
              { step: "01", title: "Email us", desc: "Tell us which slot you want and for how long." },
              { step: "02", title: "Send your banner", desc: "We accept JPG / PNG. No animations or misleading content." },
              { step: "03", title: "Review & publish", desc: "We review the ad and make it live within 24 hours." },
              { step: "04", title: "That's it", desc: "Your ad runs for the agreed period. Renew any time." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="p-6">
                <div className="text-3xl font-bold text-gray-200 mb-3 font-mono">{step}</div>
                <div className="font-semibold text-gray-900 mb-1">{title}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="bg-[#111] text-white p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xl font-bold mb-1">Ready? Let's talk.</div>
            <div className="text-gray-400 text-sm">No pressure, no long contracts to start.</div>
          </div>
          <a href="mailto:ads@theecho.in"
            className="flex-shrink-0 bg-white text-black font-bold px-8 py-3 text-sm hover:bg-gray-100 transition-colors">
            ads@theecho.in
          </a>
        </div>

      </div>
    </div>
  );
}
