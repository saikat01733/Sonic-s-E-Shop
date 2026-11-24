'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Sun, Moon, ShieldCheck, X, Zap, ChevronRight, Package, Gamepad2, Tag, Wallet, User, Home } from 'lucide-react';
import { GameItem, PackageItem, SiteSettings } from '@/lib/types';

interface NavbarProps {
  settings?: SiteSettings;
  games?: GameItem[];
}

export default function Navbar({ settings, games = [] }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
    { href: '/', label: 'হোম', icon: Home },
    { href: '/games', label: 'সব গেম', icon: Gamepad2 },
    { href: '/coupons', label: 'অফার ও কুপন', icon: Tag },
    { href: '/orders', label: 'অর্ডার ট্র্যাকিং', icon: Package },
    { href: '/wallet', label: 'ওয়ালেট', icon: Wallet },
    { href: '/account', label: 'একাউন্ট', icon: User },
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

  const matchedPackages: { game: GameItem; pkg: PackageItem }[] = [];
  if (q) {
    games.forEach(g => {
      g.packages.forEach(p => {
        if (
          p.name.toLowerCase().includes(q) ||
          `${g.name} ${p.name}`.toLowerCase().includes(q) ||
          (p.price && String(p.price).includes(q))
        ) {
          matchedPackages.push({ game: g, pkg: p });
        }
      });
    });
  }

  return (
    <header className="sticky top-3 z-50 w-full px-3 sm:px-6">
      <div className="max-w-6xl mx-auto liquid-glass-pill py-2 px-3.5 sm:px-5 flex items-center justify-between gap-3 shadow-2xl">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-500/30 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-xs sm:text-sm bg-gradient-to-r from-white via-gray-100 to-red-400 bg-clip-text text-transparent">
              {settings?.siteName || "SONIC'S E-SHOP"}
            </span>
            <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase -mt-0.5">
              LIQUID GLASS EDITION
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
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/30 scale-102'
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
              placeholder="গেম খুঁজুন..."
              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-white/8 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500/50 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-1 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Dropdown with direct links to /games/[slug] */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl liquid-glass bg-[#0c101a]/95 border border-white/20 shadow-2xl p-3 z-50 max-h-80 overflow-y-auto">
              {!q ? (
                <div>
                  <div className="text-[10px] font-bold text-gray-400 px-1 mb-1.5 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> জনপ্রিয় গেমসমূহ
                  </div>
                  {games.map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        router.push(`/games/${g.slug}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <img src={g.poster} alt={g.name} className="w-7 h-7 rounded-lg object-cover" />
                        <span className="text-xs font-bold text-white">{g.name}</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${g.badge_color}25`, color: g.badge_color }}>
                        {g.badge}
                      </span>
                    </button>
                  ))}
                </div>
              ) : matchedGames.length === 0 && matchedPackages.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400">কোনো ফলাফল পাওয়া যায়নি!</div>
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
                      className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/10 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <img src={g.poster} alt={g.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <div className="text-xs font-bold text-white">{g.name}</div>
                          <div className="text-[10px] text-emerald-400">⚡ {g.delivery_time}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-md">
                        টপ-আপ →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
            title="থিম পরিবর্তন"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Admin CMS Badge */}
          <Link
            href="/admin"
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-white text-[11px] font-extrabold transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অ্যাডমিন</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
