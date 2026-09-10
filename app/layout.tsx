import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Ticker from "@/components/layout/Ticker";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatnewsbulletin.com";
const SITE_NAME = "Bharat News Bulletin";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} (BNB) — India's Digital Newsroom`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Bharat News Bulletin (BNB) brings you breaking news, in-depth analysis, and stories from India and the world. Business, Technology, Politics, Sports, and more.",
  authors: [{ name: "Bharat News Bulletin" }],
  creator: "Bharat News Bulletin",
  publisher: "Bharat News Bulletin",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — India's Digital Newsroom`,
    description:
      "Breaking news, analysis, and stories from India and the world.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: `${SITE_NAME} News` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — India's Digital Newsroom`,
    description: "Breaking news, analysis, and stories from India and the world.",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/bnblogo.png`,
    "sameAs": [
      "https://twitter.com/BNBnews",
      "https://facebook.com/BNBnews",
      "https://instagram.com/BNBnews"
    ]
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans text-neutral-900 bg-[#FAFAFA]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <Script 
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'hi,en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Ticker />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
