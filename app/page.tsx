import { getStoreData } from '@/lib/db';
import HomeClient from '@/components/features/home/HomeClient';
import type { Metadata } from 'next';

export const revalidate = 60; // ISR cache 60s

export const metadata: Metadata = {
  title: "Sonic's E-Shop - Bangladesh's #1 Game Top-Up Store",
  description: "Official Konami eFootball Coins, PUBG Mobile UC, and Roblox Robux instant top-up in Bangladesh via bKash & Nagad.",
};

export default async function HomePage() {
  const storeData = await getStoreData();
  const initialData = {
    settings: storeData.settings,
    trustBadges: storeData.trustBadges,
    games: (storeData.games || []).filter(g => !g.isArchived && g.active !== false),
    coupons: (storeData.coupons || []).filter(c => c.active !== false),
  };

  return <HomeClient initialData={initialData} />;
}
