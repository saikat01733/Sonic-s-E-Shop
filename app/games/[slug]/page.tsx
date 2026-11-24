import { notFound } from 'next/navigation';
import { getStoreData } from '@/lib/db';
import GameDetailClient from '@/components/features/games/GameDetailClient';
import type { Metadata } from 'next';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const storeData = await getStoreData();
  const game = (storeData.games || []).find(
    g => g.slug === slug || g.id === slug
  );

  if (!game) {
    return {
      title: 'Game Not Found - Sonic\'s E-Shop',
    };
  }

  const siteUrl = process.env.SITE_URL || 'https://sonic-s-e-shop.vercel.app';
  const title = `${game.name} Top-Up in Bangladesh - Sonic's E-Shop`;
  const description = game.description || `Instant automated ${game.name} top-up in Bangladesh via bKash & Nagad personal send-money. Delivery in 1-10 mins.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/games/${game.slug}`,
      images: [{ url: game.poster || '/banner.webp', alt: game.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [game.poster || '/banner.webp'],
    },
  };
}

export async function generateStaticParams() {
  try {
    const storeData = await getStoreData();
    return (storeData.games || []).map(g => ({
      slug: g.slug,
    }));
  } catch {
    return [];
  }
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params;
  const storeData = await getStoreData();

  const game = (storeData.games || []).find(
    g => g.slug === slug || g.id === slug
  );

  if (!game) {
    notFound();
  }

  const activeGames = (storeData.games || []).filter(g => !g.isArchived && g.active !== false);
  const activeCoupons = (storeData.coupons || []).filter(c => c.active !== false);

  return (
    <GameDetailClient
      initialGame={game}
      allGames={activeGames}
      settings={storeData.settings}
      coupons={activeCoupons}
    />
  );
}
