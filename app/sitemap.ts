import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sonicseshop.com';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/games',
    '/games/efootball-coin',
    '/games/pubg-mobile-uc',
    '/games/roblox-robux',
    '/coupons',
    '/orders',
    '/wallet',
    '/account',
    '/login',
    '/signup',
  ];

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/games') ? 0.9 : 0.7,
  }));
}
