import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/hooks/use-language';
import { AuthProvider } from '@/hooks/use-auth';
import BottomDock from '@/components/common/BottomDock';

export const metadata: Metadata = {
  metadataBase: new URL('https://sonicseshop.com'),
  title: "Sonic's E-Shop - Bangladesh's #1 Game Top-Up Store",
  description: "Official Konami eFootball Coins, PUBG Mobile UC, and Roblox Robux instant top-up in Bangladesh via bKash & Nagad.",
  keywords: ["eFootball coins Bangladesh", "PUBG UC top up bd", "Roblox Robux bd", "bKash game top up", "Nagad game shop"],
  authors: [{ name: "md-asif-iqbal" }],
  openGraph: {
    title: "Sonic's E-Shop - Instant Game Top-Up in Bangladesh",
    description: "Instant delivery for eFootball, PUBG UC, and Roblox Robux with 100% account guarantee via bKash & Nagad.",
    url: "https://sonicseshop.com",
    siteName: "Sonic's E-Shop",
    locale: "en_US",
    type: "website",
    images: [{ url: "/banner.webp", width: 1200, height: 630, alt: "Sonic's E-Shop Banner" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sonic's E-Shop - Bangladesh's #1 Game Top-Up Store",
    description: "Official Konami eFootball Coins, PUBG UC, and Roblox Robux instant delivery via bKash & Nagad.",
    images: ["/banner.webp"],
  },
  icons: {
    icon: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "Sonic's E-Shop",
    "url": "https://sonicseshop.com",
    "description": "Official gaming digital top-up store in Bangladesh providing instant eFootball Coins, PUBG Mobile UC, and Roblox Robux via bKash & Nagad.",
    "telephone": "+8801733185830",
    "currenciesAccepted": "BDT",
    "paymentAccepted": "bKash, Nagad",
    "priceRange": "৳50 - ৳15000"
  };

  return (
    <html lang="en" className="dark-theme">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className="antialiased selection:bg-rose-600 selection:text-white relative min-h-screen">
        <AuthProvider>
          <LanguageProvider>
            {/* Deep Ocean Blue Ambient Lighting Engine */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              <div className="ambient-glow-ocean" />
              <div className="ambient-glow-cobalt" />
              <div className="ambient-glow-midnight" />
              <div className="ambient-glow-ice" />
              <div className="refractive-grid" />
            </div>

            {/* Main App Page Content Container */}
            <div className="relative z-10 flex flex-col min-h-screen pb-20 sm:pb-16">
              {children}
            </div>

            {/* Apple VisionOS Floating Ocean Glass Bottom Navigation Dock */}
            <BottomDock />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
