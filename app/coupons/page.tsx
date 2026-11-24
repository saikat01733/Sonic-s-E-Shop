import { getStoreData } from '@/lib/db';
import CouponsClient from '@/components/features/coupons/CouponsClient';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Special Coupons & Promo Vouchers - Sonic's E-Shop",
  description: "Apply active promo codes at checkout to enjoy instant discounts on eFootball, PUBG UC, and Roblox Robux.",
};

export default async function CouponsPage() {
  const storeData = await getStoreData();
  const initialData = {
    coupons: (storeData.coupons || []).filter(c => c.active !== false),
    games: (storeData.games || []).filter(g => !g.isArchived && g.active !== false),
    settings: storeData.settings,
  };

  return <CouponsClient initialData={initialData} />;
}
