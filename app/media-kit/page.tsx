import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Media Kit | Bharat News Bulletin",
  description: "Audience data, ad specifications, and partnership information for Bharat News Bulletin — India's independent digital newsroom.",
};

const ADS_EMAIL = "support@techecho.in";

export default function MediaKitPage() {
  return (
    <div className="bg-gray-50 dark:bg-[#111111] min-h-screen text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 pb-24">

      {/* Hero */}
      <div className="bg-gray-900 dark:bg-black border-b border-gray-800 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 70% 10%, #3b82f6 0%, transparent 40%)' }}></div>
        
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <p className="text-blue-500 font-bold text-xs uppercase tracking-[0.15em] mb-4">
            Media Kit · 2026
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
            Bharat News Bulletin
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
            Audience data, advertising specifications, and partnership information for brands and media buyers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-16">

        {/* About */}
        <section className="mb-20">
          <p className="text-blue-600 dark:text-blue-500 font-bold text-xs uppercase tracking-[0.15em] mb-2">The Publication</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">About BNB</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            <div className="space-y-6">
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                <strong className="text-gray-900 dark:text-white">Bharat News Bulletin (BNB)</strong> is an independent English-language digital news publication based in India.
                We cover Business, Technology, Markets, Sports, Lifestyle, and more — with original reporting and analysis.
              </p>
              <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                We do not answer to any political group, corporate house, or investor. This independence is why our audience trusts us.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Founded", "2026"],
                ["Language", "English"],
                ["Geography", "India"],
                ["Categories", "12+"],
                ["Audience", "Growing"],
                ["Ownership", "Independent"],
              ].map(([label, value]) => (
                <div key={label} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-[0.1em] mb-1">{label}</div>
                  <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audience */}
        <section className="mb-20 border-t border-gray-200 dark:border-gray-800 pt-16">
          <p className="text-blue-600 dark:text-blue-500 font-bold text-xs uppercase tracking-[0.15em] mb-2">Audience</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">Who reads BNB</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              ["Primary Age Range", "18–45 years"],
              ["Geography", "India (English-speaking)"],
              ["Reader Profile", "Professionals, students, entrepreneurs"],
              ["Reading Intent", "News-focused, not casual scrolling"],
            ].map(([label, value]) => (
              <div key={label} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-[0.1em] mb-2">{label}</div>
                <div className="text-base font-bold text-gray-900 dark:text-white">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Specs */}
        <section className="mb-20 border-t border-gray-200 dark:border-gray-800 pt-16">
          <p className="text-blue-600 dark:text-blue-500 font-bold text-xs uppercase tracking-[0.15em] mb-2">Specifications</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">Ad Formats & Rates</h2>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  {["Format", "Dimensions", "File Types", "Placement", "Rate"].map(h => (
                    <th key={h} className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[
                  ["Leaderboard", "728 × 90 px", "JPG, PNG, WebP", "Article top", "₹3,500 /mo"],
                  ["Sidebar Box", "300 × 250 px", "JPG, PNG, WebP", "Article sidebar", "₹1,500 /mo"],
                  ["In-Article", "300 × 250 px", "JPG, PNG, WebP", "Mid-article", "₹2,000 /mo"],
                  ["Homepage Hero", "970 × 250 px", "JPG, PNG, WebP", "Homepage top", "₹5,000 /mo"],
                  ["Sponsored Article", "Full article", "Copy + Images", "Permanent", "₹2,000 /article"],
                ].map((row) => (
                  <tr key={row[0]} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{row[0]}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs whitespace-nowrap">{row[1]}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs whitespace-nowrap">{row[2]}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{row[3]}</td>
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Content Policy */}
        <section className="mb-20 border-t border-gray-200 dark:border-gray-800 pt-16">
          <p className="text-blue-600 dark:text-blue-500 font-bold text-xs uppercase tracking-[0.15em] mb-2">Policy</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">What we don't accept</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl text-base">All ads are manually reviewed by our editorial team before going live. We strictly reject the following:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Misleading or false claims",
              "Adult or age-restricted content",
              "Political campaign advertisements",
              "Animated or auto-playing media",
              "Ads imitating editorial content",
              "Products illegal under Indian law",
            ].map(rule => (
              <div key={rule} className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-sm text-gray-800 dark:text-gray-200">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span className="leading-snug">{rule}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-700 to-[#472066] rounded-2xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l-4 4h8l-4-4zm-4 20l4 4 4-4h-8zm16-8l-4-4v8l4-4zM0 12l4 4V8l-4 4z"></path></svg>
          </div>
          
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Ready to advertise with BNB?</h3>
            <p className="text-blue-100 text-base max-w-md">Email our team for a personalised package. We usually respond within 24 hours.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a href={`mailto:${ADS_EMAIL}`} className="inline-flex items-center justify-center bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm px-6 py-3.5 rounded-xl transition-colors shadow-lg w-full sm:w-auto">
              {ADS_EMAIL}
            </a>
            <Link href="/advertise" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/20 transition-colors w-full sm:w-auto">
              View Packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
