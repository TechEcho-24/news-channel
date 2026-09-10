import Link from "next/link";
import { Globe, Link as LinkIcon, Rss, Share2 } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-900 pt-16 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <Image src="/bnblogo.png" alt="BNB Logo" width={110} height={44} className="object-contain h-11 w-auto" />
              <span className="border-l-2 border-gray-300 pl-3 text-xs font-bold tracking-widest uppercase text-gray-500 group-hover:text-blue-600 transition-colors leading-tight">
                Bharat News Bulletin
              </span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-sm text-sm leading-relaxed">
              Premium digital media organization delivering breaking news, business insights, and editorial excellence.
            </p>
            <form className="flex mt-4 max-w-sm">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white border border-gray-300 text-gray-900 px-4 py-2 flex-1 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold transition-colors rounded-r-md">
                Subscribe
              </button>
            </form>
          </div>

          {/* News Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter text-gray-900">News</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/india" className="hover:text-blue-600 transition-colors">India</Link></li>
              <li><Link href="/world" className="hover:text-blue-600 transition-colors">World</Link></li>
              <li><Link href="/business" className="hover:text-blue-600 transition-colors">Business</Link></li>
              <li><Link href="/technology" className="hover:text-blue-600 transition-colors">Technology</Link></li>
              <li><Link href="/health" className="hover:text-blue-600 transition-colors">Health</Link></li>
              <li><Link href="/markets" className="hover:text-blue-600 transition-colors">Markets</Link></li>
              <li><Link href="/startups" className="hover:text-blue-600 transition-colors">Startups</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter text-gray-900">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="/advertise" className="hover:text-blue-600 transition-colors">Advertise With Us</Link></li>
              <li><Link href="/media-kit" className="hover:text-blue-600 transition-colors">Media Kit</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold capitalize tracking-wider mb-4 text-sm font-inter text-gray-900">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Bharat News Bulletin (BNB). All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Globe size={20} /></Link>
            <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Share2 size={20} /></Link>
            <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><LinkIcon size={20} /></Link>
            <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Rss size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
