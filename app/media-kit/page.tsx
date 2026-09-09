import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Media Kit | Bharat News Bulletin (BNB)",
  description: "Audience data, ad specifications, and partnership information for Bharat News Bulletin (BNB) — India's independent digital newsroom.",
};

export default function MediaKitPage() {
  return (
    <div className="bg-white">

      {/* Header */}
      <div className="border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Bharat News Bulletin (BNB) · Media Kit 2026</p>
          <h1 className="text-5xl font-serif font-bold text-gray-900">Media Kit</h1>
          <p className="text-gray-600 mt-3 text-lg">For brands, agencies, and media buyers.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-16">

        {/* What is a Media Kit — human explanation */}
        <section className="bg-gray-50 border border-gray-200 p-7">
          <h2 className="font-bold text-gray-900 mb-2">What is a Media Kit?</h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
            A media kit is a reference document for brands or agencies who want to advertise with us. It tells you who our readers are, where your ad will appear, what sizes we accept, and what we charge. Think of it as our advertising brochure.
          </p>
        </section>

        {/* The Publication */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-t border-gray-200 pt-8 mb-8">The Publication</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Bharat News Bulletin (BNB)</strong> is an independent English-language news publication based in India. We cover Business, Technology, Markets, Politics, Sports, and Lifestyle with original reporting and analysis.
              </p>
              <p>
                We are reader-funded through advertising and do not answer to any political group, corporate house, or investor. This independence is the reason our audience trusts us.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Founded", value: "2026" },
                { label: "Language", value: "English" },
                { label: "Geography", value: "India" },
                { label: "Categories", value: "12" },
                { label: "Audience", value: "Growing" },
                { label: "Ownership", value: "Independent" },
              ].map(({ label, value }) => (
                <div key={label} className="border border-gray-200 p-4">
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">{label}</div>
                  <div className="font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-t border-gray-200 pt-8 mb-8">Our Audience</h2>
          <div className="grid md:grid-cols-3 gap-0 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {[
              { label: "Primary Age Range", value: "18–45 years" },
              { label: "Primary Market", value: "India (English-speaking)" },
              { label: "Reader Type", value: "Professionals, students, entrepreneurs" },
            ].map(({ label, value }) => (
              <div key={label} className="p-6">
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">{label}</div>
                <div className="text-gray-900 font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Specs table */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-t border-gray-200 pt-8 mb-8">Ad Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200">
              <thead className="bg-gray-50 text-left">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Format</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Dimensions</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">File Types</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Placement</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Leaderboard", "728 × 90 px", "JPG, PNG, WebP", "Article top", "₹3,500 /mo"],
                  ["Sidebar Box", "300 × 250 px", "JPG, PNG, WebP", "Article sidebar", "₹1,500 /mo"],
                  ["In-Article", "300 × 250 px", "JPG, PNG, WebP", "Mid-article", "₹2,000 /mo"],
                  ["Homepage Hero", "970 × 250 px", "JPG, PNG, WebP", "Homepage top", "₹5,000 /mo"],
                  ["Sponsored Article", "Full article", "Copy + Images", "Permanent", "₹2,000 /article"],
                ].map(row => (
                  <tr key={row[0]} className="hover:bg-gray-50">
                    {row.map((cell, i) => (
                      <td key={i} className={`px-5 py-3.5 ${i === 0 ? "font-semibold text-gray-900" : "text-gray-600"} ${i === 2 ? "font-mono text-xs" : ""} ${i === 4 ? "font-semibold text-blue-600" : ""}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Content Policy */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-t border-gray-200 pt-8 mb-6">Content Policy</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">All ads are reviewed before going live. We do not accept:</p>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              "Misleading or false claims",
              "Adult or age-restricted content",
              "Political campaign advertisements",
              "Animated or auto-playing ads",
              "Ads that imitate editorial content without clear labeling",
              "Products/services illegal in India",
            ].map(rule => (
              <div key={rule} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-red-400 flex-shrink-0 mt-0.5">✕</span>
                {rule}
              </div>
            ))}
          </div>
        </section>

        {/* Contact strip */}
        <div className="border-t border-gray-200 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-gray-900">Interested in advertising?</div>
            <div className="text-sm text-gray-500">Email our advertising team for a personalised package.</div>
          </div>
          <div className="flex gap-4">
            <a href="mailto:ads@bnbnews.in" className="bg-blue-600 text-white font-semibold px-6 py-2.5 text-sm hover:bg-blue-700 transition-colors">
              ads@bnbnews.in
            </a>
            <Link href="/advertise" className="border border-gray-300 text-gray-700 font-semibold px-6 py-2.5 text-sm hover:bg-gray-50 transition-colors">
              View Packages
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
