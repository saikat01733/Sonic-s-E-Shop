import { getStoreData } from '@/lib/db';
import AllGamesClient from '@/components/features/games/AllGamesClient';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Games Catalog - Sonic's E-Shop",
  description: "Browse official gaming top-up packages for eFootball Coins, PUBG Mobile UC, and Roblox Robux in Bangladesh.",
};

export default async function GamesPage() {
  const storeData = await getStoreData();
  const initialData = {
    games: (storeData.games || []).filter(g => !g.isArchived && g.active !== false),
    settings: storeData.settings,
  };

  return <AllGamesClient initialData={initialData} />;
}
