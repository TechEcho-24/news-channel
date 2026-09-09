import Link from "next/link";
import { Globe, Link as LinkIcon, Rss, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-16 pb-8 border-t-4 border-blue-600">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <span className="text-4xl font-serif font-extrabold italic tracking-tighter leading-none">
                <span className="text-white">B</span><span className="text-red-600">N</span><span className="text-white">B</span>
              </span>
              <span className="border-l border-gray-700 pl-3 text-xs font-bold tracking-widest uppercase text-gray-300 group-hover:text-white transition-colors leading-tight">
                Bharat News Bulletin
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm text-sm leading-relaxed">
              Premium digital media organization delivering breaking news, business insights, and editorial excellence.
            </p>
            <form className="flex mt-4 max-w-sm">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-gray-800 text-white px-4 py-2 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold transition-colors">
                Subscribe
              </button>
            </form>
          </div>

          {/* News Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter">News</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/india" className="hover:text-white transition-colors">India</Link></li>
              <li><Link href="/world" className="hover:text-white transition-colors">World</Link></li>
              <li><Link href="/business" className="hover:text-white transition-colors">Business</Link></li>
              <li><Link href="/technology" className="hover:text-white transition-colors">Technology</Link></li>
              <li><Link href="/markets" className="hover:text-white transition-colors">Markets</Link></li>
              <li><Link href="/startups" className="hover:text-white transition-colors">Startups</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/advertise" className="hover:text-white transition-colors">Advertise With Us</Link></li>
              <li><Link href="/media-kit" className="hover:text-white transition-colors">Media Kit</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Bharat News Bulletin (BNB). All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors"><Globe size={20} /></Link>
            <Link href="#" className="hover:text-white transition-colors"><Share2 size={20} /></Link>
            <Link href="#" className="hover:text-white transition-colors"><LinkIcon size={20} /></Link>
            <Link href="#" className="hover:text-white transition-colors"><Rss size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
