import { Home, Gamepad2, Tag, Package, Wallet, User, ShieldCheck } from 'lucide-react';

export const APP_ROUTES = {
  HOME: '/',
  GAMES: '/games',
  COUPONS: '/coupons',
  ORDERS: '/orders',
  WALLET: '/wallet',
  ACCOUNT: '/account',
  ADMIN: '/admin',
} as const;

export const MAIN_NAV_LINKS = [
  { href: APP_ROUTES.HOME, label: 'হোম', icon: Home },
  { href: APP_ROUTES.GAMES, label: 'সব গেম', icon: Gamepad2 },
  { href: APP_ROUTES.COUPONS, label: 'অফার ও কুপন', icon: Tag },
  { href: APP_ROUTES.ORDERS, label: 'অর্ডার ট্র্যাকিং', icon: Package },
  { href: APP_ROUTES.WALLET, label: 'ওয়ালেট', icon: Wallet },
  { href: APP_ROUTES.ACCOUNT, label: 'একাউন্ট', icon: User },
];

export const DEFAULT_SETTINGS = {
  siteName: "Sonic's E-Shop",
  logo: '/logo.png',
  tickerText: '⚡ ডেলিভারি সময় ১-১০ মিনিট • ১০০% নিরাপদ টপ-আপ গ্যারান্টি • bKash ও Nagad পার্সোনাল সেন্ড মানি • যেকোনো সমস্যায় WhatsApp: 01733185830',
  heroBanner: '/banner.webp',
  heroTitle: "SONIC'S E-SHOP",
  heroSubtitle: 'Game Top-Up & Digital Goods BD',
  supportPhone: '01733185830',
  whatsappUrl: 'https://wa.me/8801733185830',
  facebookUrl: 'https://facebook.com',
  bkashNumber: '01733185830',
  nagadNumber: '01733185830',
  adminPin: 'sonic2026',
};
