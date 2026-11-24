'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Sun,
  Moon,
  ShieldCheck,
  X,
  Zap,
  Package,
  Gamepad2,
  Tag,
  Wallet,
  User,
  Home,
  Globe,
  ChevronDown,
  LogOut,
  Settings,
  Crown,
  LayoutDashboard
} from 'lucide-react';
import { GameItem, SiteSettings } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';

interface NavbarProps {
  settings?: SiteSettings;
  games?: GameItem[];
}

export default function Navbar({ settings, games = [] }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, toggleLocale, t } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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
    <header className="sticky top-2.5 z-50 w-full px-2 sm:px-6">
      <div className="max-w-6xl mx-auto liquid-glass-pill py-2 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 shadow-2xl flex-nowrap">
        {/* Brand Logo - STRICTLY 1-LINE HORIZONTAL ALIGNMENT */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0 whitespace-nowrap">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-extrabold tracking-wider text-xs sm:text-sm bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              {settings?.siteName || t('siteName')}
            </span>
            <span className="hidden md:inline-block text-[9px] text-cyan-300 font-extrabold px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30">
              OCEAN
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 whitespace-nowrap">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/35 scale-102 border border-cyan-400/40'
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
              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-white/[0.08] border border-cyan-500/20 text-xs text-white focus:outline-none focus:border-cyan-400/60 placeholder:text-gray-400 backdrop-blur-xl"
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

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl liquid-glass bg-[#08172e]/95 border border-cyan-500/30 shadow-2xl p-3 z-50 max-h-80 overflow-y-auto">
              {!q ? (
                <div>
                  <div className="text-[10px] font-bold text-cyan-300 px-1 mb-1.5 flex items-center gap-1">
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
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-md">
                        {t('topUpBtn')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons: Language Toggle + Theme + Dynamic RBAC Auth Avatar */}
        <div className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
          {/* Bilingual Language Switcher (EN | বাং) */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-cyan-500/20 text-white text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer shadow-sm"
            title="Switch Language / ভাষা পরিবর্তন"
          >
            <Globe className="w-3 h-3 text-cyan-400" />
            <span className={locale === 'en' ? 'text-cyan-300' : 'text-gray-400'}>EN</span>
            <span className="text-gray-500">|</span>
            <span className={locale === 'bn' ? 'text-cyan-300' : 'text-gray-400'}>বাং</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Theme Toggle"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* RBAC AUTHENTICATION AVATAR & DROPDOWN */}
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-cyan-300 hover:text-white text-[11px] font-extrabold transition-all cursor-pointer shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          ) : (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border transition-all cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-md shadow-amber-500/20'
                    : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                  {isAdmin ? <Crown className="w-3 h-3 text-amber-300" /> : user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[11px] font-extrabold hidden sm:inline-block max-w-[80px] truncate">
                  {isAdmin ? 'Admin' : user?.name}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Dynamic RBAC Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl liquid-glass bg-[#08172e]/95 border border-cyan-500/35 p-2 shadow-2xl z-50 text-xs space-y-1 backdrop-blur-3xl animate-fadeIn">
                  {/* User Profile Header */}
                  <div className="p-2 border-b border-white/10 mb-1">
                    <div className="font-bold text-white truncate">{user?.name}</div>
                    <div className="text-[10px] text-gray-400 flex items-center justify-between mt-0.5">
                      <span>{user?.phone}</span>
                      <span className={`px-1.5 py-0.2 rounded-full font-extrabold uppercase text-[9px] ${isAdmin ? 'bg-amber-400/20 text-amber-300' : 'bg-cyan-400/20 text-cyan-300'}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  {isAdmin ? (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-white font-bold transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-400" />
                        <span>Admin CMS Dashboard</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        <Gamepad2 className="w-4 h-4 text-cyan-400" />
                        <span>Manage Games & Packages</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        <Package className="w-4 h-4 text-emerald-400" />
                        <span>Manage Live Orders</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-white font-bold transition-colors"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>My Account Profile</span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        <Package className="w-4 h-4 text-amber-400" />
                        <span>My Orders & Invoices</span>
                      </Link>
                      <Link
                        href="/wallet"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>My Gamer Wallet (৳{user?.walletBalance || 0})</span>
                      </Link>
                    </>
                  )}

                  <div className="border-t border-white/10 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-red-500/20 text-red-300 font-bold transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
