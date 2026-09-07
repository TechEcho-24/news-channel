import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | The Echo",
  description: "The Echo is an independent digital newsroom committed to honest, fearless journalism for India.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* Opening Statement */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-4">Est. 2026 · India</p>
            <h1 className="text-5xl font-serif font-bold leading-tight text-gray-900 mb-6">
              We report the stories<br />that need to be told.
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              The Echo is an independent digital newsroom built on one belief: that people deserve honest, clear, and fearless journalism — free from corporate or political pressure.
            </p>
          </div>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <div className="text-4xl font-bold text-gray-900">12+</div>
              <div className="text-gray-500 text-sm mt-1">Topics we cover daily</div>
            </div>
            <div className="border-l-4 border-gray-300 pl-6">
              <div className="text-4xl font-bold text-gray-900">100%</div>
              <div className="text-gray-500 text-sm mt-1">Independently owned</div>
            </div>
            <div className="border-l-4 border-gray-300 pl-6">
              <div className="text-4xl font-bold text-gray-900">0</div>
              <div className="text-gray-500 text-sm mt-1">Political affiliations</div>
            </div>
          </div>
        </div>
      </section>

      {/* What we believe */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">What We Stand For</h2>
          <div className="grid md:grid-cols-3 gap-0 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
            {[
              {
                word: "Accuracy",
                desc: "We verify every fact before publishing. If we get something wrong, we correct it — publicly and promptly.",
              },
              {
                word: "Clarity",
                desc: "Jargon slows readers down. We write so that anyone can understand complex stories without a dictionary.",
              },
              {
                word: "Independence",
                desc: "No advertiser, investor, or political party influences what we report. Our newsroom is our own.",
              },
            ].map(({ word, desc }) => (
              <div key={word} className="p-8">
                <div className="text-2xl font-bold text-gray-900 mb-3">{word}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we cover */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">What We Cover</h2>
          <div className="flex flex-wrap gap-3">
            {["India", "World", "Business", "Technology", "Startups", "Markets", "Sports", "Lifestyle", "Entertainment", "Automobile", "Reviews"].map(topic => (
              <Link
                key={topic}
                href={`/${topic.toLowerCase()}`}
                className="border border-gray-300 hover:border-blue-600 hover:text-blue-600 px-4 py-2 text-sm font-medium text-gray-700 transition-colors rounded-sm"
              >
                {topic} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="bg-[#111] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Have a story for us?</h2>
            <p className="text-gray-400 text-sm">Tips, corrections, partnership ideas — we read everything.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition-colors text-sm">
              Contact Us
            </Link>
            <Link href="/advertise" className="border border-gray-600 hover:border-white text-gray-300 hover:text-white font-semibold px-6 py-3 transition-colors text-sm">
              Advertise
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
