import type { Metadata, Viewport } from 'next';
import './globals.css';

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
    <html lang="bn" className="dark-theme">
      <body className="antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
