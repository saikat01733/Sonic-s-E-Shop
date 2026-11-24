import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL || 'https://sonic-s-e-shop.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/wallet', '/orders', '/login', '/signup', '/account'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
