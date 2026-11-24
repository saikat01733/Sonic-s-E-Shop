import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/hooks/use-language';
import BottomDock from '@/components/common/BottomDock';

export const metadata: Metadata = {
  title: "Sonic's E-Shop - Bangladesh's #1 Game Top-Up Store",
  description: "Official Konami eFootball Coins, PUBG Mobile UC, and Roblox Robux instant top-up in Bangladesh via bKash & Nagad.",
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
  return (
    <html lang="en" className="dark-theme">
      <body className="antialiased selection:bg-red-500 selection:text-white relative min-h-screen">
        <LanguageProvider>
          {/* Dynamic Bioluminescent Mesh Background Light Nodes */}
          <div className="ambient-glow-red" />
          <div className="ambient-glow-cyan" />
          <div className="ambient-glow-purple" />
          <div className="ambient-glow-amber" />

          {/* Subtle Geometric Refractive Grid Overlay */}
          <div className="refractive-grid" />

          {/* Main App Page Content Container */}
          <div className="relative z-10 flex flex-col min-h-screen pb-20 sm:pb-16">
            {children}
          </div>

          {/* Apple VisionOS Floating Liquid Glass Bottom Navigation Dock */}
          <BottomDock />
        </LanguageProvider>
      </body>
    </html>
  );
}
