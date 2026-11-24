'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Sun, Moon, ShieldCheck, X, Zap, ChevronRight, Package, Gamepad2, Tag, Wallet, User, Home, Globe } from 'lucide-react';
import { GameItem, PackageItem, SiteSettings } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';

interface NavbarProps {
  settings?: SiteSettings;
  games?: GameItem[];
}

export default function Navbar({ settings, games = [] }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, toggleLocale, t } = useLanguage();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('sonic_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = `${savedTheme}-theme`;
    }

    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sonic_theme', next);
    document.documentElement.className = `${next}-theme`;
  };

  const navLinks = [
    { href: '/', label: t('navHome'), icon: Home },
    { href: '/games', label: t('navGames'), icon: Gamepad2 },
    { href: '/coupons', label: t('navCoupons'), icon: Tag },
    { href: '/orders', label: t('navOrders'), icon: Package },
    { href: '/wallet', label: t('navWallet'), icon: Wallet },
    { href: '/account', label: t('navAccount'), icon: User },
  ];

  const q = searchQuery.trim().toLowerCase();
  const matchedGames = q
    ? games.filter(
        g =>
          g.name.toLowerCase().includes(q) ||
          (g.name_bn && g.name_bn.toLowerCase().includes(q)) ||
          g.category_name.toLowerCase().includes(q)
      )
    : [];

  return (
    <header className="sticky top-3 z-50 w-full px-3 sm:px-6">
      <div className="max-w-6xl mx-auto liquid-glass-pill py-2 px-3 sm:px-5 flex items-center justify-between gap-3 shadow-2xl">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-500/40 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-xs sm:text-sm bg-gradient-to-r from-white via-gray-100 to-red-400 bg-clip-text text-transparent">
              {settings?.siteName || t('siteName')}
            </span>
            <span className="text-[9px] text-red-400 font-extrabold tracking-widest uppercase -mt-0.5">
              {t('liquidGlassEdition')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/35 scale-102'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Global Live Search */}
        <div ref={searchRef} className="relative flex-1 max-w-xs hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-xs text-white focus:outline-none focus:border-red-500/60 placeholder:text-gray-400 backdrop-blur-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-1 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Dropdown with direct links to /games/[slug] */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl liquid-glass bg-white/[0.08] border border-white/25 shadow-2xl p-3 z-50 max-h-80 overflow-y-auto">
              {!q ? (
                <div>
                  <div className="text-[10px] font-bold text-gray-300 px-1 mb-1.5 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> {t('popularGames')}
                  </div>
                  {games.map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        router.push(`/games/${g.slug}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-white/15 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img src={g.poster} alt={g.name} className="w-7 h-7 rounded-lg object-cover" />
                        <span className="text-xs font-bold text-white">{locale === 'bn' && g.name_bn ? g.name_bn : g.name}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${g.badge_color}30`, color: g.badge_color }}>
                        {g.badge}
                      </span>
                    </button>
                  ))}
                </div>
              ) : matchedGames.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-300">{t('noResults')}</div>
              ) : (
                <div className="space-y-2">
                  {matchedGames.map(g => (
                    <div
                      key={g.id}
                      onClick={() => {
                        router.push(`/games/${g.slug}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/15 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img src={g.poster} alt={g.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <div className="text-xs font-bold text-white">{locale === 'bn' && g.name_bn ? g.name_bn : g.name}</div>
                          <div className="text-[10px] text-emerald-400">⚡ {g.delivery_time}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-md">
                        {t('topUpBtn')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons: Language Toggle + Theme Switcher + Admin */}
        <div className="flex items-center gap-1.5">
          {/* Bilingual Language Switcher (EN | বাং) */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 text-white text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer shadow-sm"
            title="Switch Language / ভাষা পরিবর্তন"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span className={locale === 'en' ? 'text-amber-300' : 'text-gray-400'}>EN</span>
            <span className="text-gray-500">|</span>
            <span className={locale === 'bn' ? 'text-amber-300' : 'text-gray-400'}>বাং</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Theme Toggle"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Admin CMS Badge */}
          <Link
            href="/admin"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 hover:bg-red-500/35 border border-red-500/40 text-red-300 hover:text-white text-[11px] font-extrabold transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('navAdmin')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
