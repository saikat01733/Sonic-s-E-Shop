import { MetadataRoute } from 'next';
import { getStoreData } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || 'https://sonic-s-e-shop.vercel.app';
  const currentDate = new Date().toISOString();

  let games: { slug: string }[] = [];
  try {
    const data = await getStoreData();
    games = (data.games || []).filter(g => !g.isArchived && g.active !== false);
  } catch (e) {
    console.error('Error fetching games for sitemap:', e);
  }

  const staticRoutes = [
    '',
    '/games',
    '/coupons',
    '/orders',
    '/wallet',
    '/login',
    '/signup',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(route => ({
    url: `${siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  const gameEntries: MetadataRoute.Sitemap = games.map(game => ({
    url: `${siteUrl}/games/${game.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticEntries, ...gameEntries];
}
