'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Sun,
  Moon,
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
  Crown,
  LayoutDashboard
} from 'lucide-react';
import { GameItem, SiteSettings } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import SearchModal from '@/components/common/SearchModal';

interface NavbarProps {
  settings?: SiteSettings;
  games?: GameItem[];
}

export default function Navbar({ settings, games = [] }: NavbarProps) {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('sonic_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = `${savedTheme}-theme`;
    }

    function handleClickOutside(event: MouseEvent) {
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

  return (
    <>
      <header className="sticky top-0 z-[100] w-full pt-2 pb-2 px-2 sm:px-4 md:px-6 backdrop-blur-xl bg-[#030712]/80 [html.light-theme_&]:bg-slate-50/85 border-b border-white/5 [html.light-theme_&]:border-black/5 transition-all">
        <div className="max-w-6xl mx-auto liquid-glass-pill py-1.5 sm:py-2 px-2.5 sm:px-5 flex items-center justify-between gap-1.5 sm:gap-4 shadow-2xl flex-nowrap min-h-[44px]">
          {/* Brand Logo - STRICT 1-LINE HORIZONTAL ALIGNMENT (320px-1440px) */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
            <img
              src={settings?.logo || '/logo.png'}
              alt={settings?.siteName || t('siteName')}
              className="h-6 sm:h-7 md:h-8 w-auto max-w-[105px] sm:max-w-[130px] md:max-w-[160px] object-contain flex-shrink-0"
              onError={(e: any) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) e.target.nextElementSibling.classList.remove('hidden');
              }}
            />
            <div className="hidden w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-rose-900/40 group-hover:scale-105 transition-transform flex-shrink-0">
              ⚡
            </div>
            <span className="font-extrabold tracking-tight text-xs sm:text-sm text-white [html.light-theme_&]:text-slate-900 whitespace-nowrap flex-shrink-0 hidden lg:inline">
              {settings?.siteName || t('siteName')}
            </span>
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
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/35 border border-rose-500/40'
                      : 'text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-slate-950 hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Search Icon Button + Language Toggle + Theme Switcher + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
            {/* Compact Search Icon Trigger (Desktop + Mobile) */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="p-1.5 sm:p-2 rounded-full bg-white/[0.08] [html.light-theme_&]:bg-black/[0.04] hover:bg-white/[0.16] [html.light-theme_&]:hover:bg-black/[0.08] border border-white/10 [html.light-theme_&]:border-black/10 text-rose-400 [html.light-theme_&]:text-rose-600 transition-all cursor-pointer flex-shrink-0 hover:scale-105 active:scale-95 shadow-sm"
              title="Search Games (⌘K / Ctrl+K)"
              aria-label="Open Search Modal"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Bilingual Switcher (EN | বাং) - Desktop & Tablet */}
            <button
              onClick={toggleLocale}
              className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-full bg-white/[0.08] [html.light-theme_&]:bg-black/[0.04] hover:bg-white/[0.16] [html.light-theme_&]:hover:bg-black/[0.08] border border-white/10 [html.light-theme_&]:border-black/10 text-white [html.light-theme_&]:text-slate-800 text-[9px] sm:text-[11px] font-extrabold transition-all cursor-pointer shadow-sm flex-shrink-0"
              title="Switch Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 [html.light-theme_&]:text-rose-600 flex-shrink-0" />
              <span className={locale === 'en' ? 'text-rose-400 [html.light-theme_&]:text-rose-600 font-black' : 'text-gray-400 [html.light-theme_&]:text-slate-500'}>EN</span>
              <span className="text-gray-500 [html.light-theme_&]:text-slate-400 text-[8px] sm:text-[10px]">|</span>
              <span className={locale === 'bn' ? 'text-rose-400 [html.light-theme_&]:text-rose-600 font-black' : 'text-gray-400 [html.light-theme_&]:text-slate-500'}>বাং</span>
            </button>

            {/* Theme Switcher - Desktop & Tablet */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-full bg-white/[0.08] [html.light-theme_&]:bg-black/[0.04] hover:bg-white/[0.16] [html.light-theme_&]:hover:bg-black/[0.08] border border-white/10 [html.light-theme_&]:border-black/10 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors cursor-pointer flex-shrink-0"
              title="Theme Toggle"
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-300" />
              ) : (
                <Moon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-600" />
              )}
            </button>

            {/* RBAC Authentication Button & Dropdown */}
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-xs font-black transition-all cursor-pointer shadow-md shadow-rose-900/35 border border-rose-500/40 flex-shrink-0 hover:scale-105 active:scale-95"
                title="Login / লগইন"
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{locale === 'bn' ? 'লগইন' : 'Login'}</span>
              </Link>
            ) : (
              <div ref={userMenuRef} className="relative flex-shrink-0 flex items-center">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-1 sm:gap-1.5 py-1 px-2 sm:px-2.5 rounded-full border transition-all cursor-pointer flex-shrink-0 ${
                    isAdmin
                      ? 'bg-rose-600/20 border-rose-500/50 text-rose-400 [html.light-theme_&]:text-rose-600 shadow-md shadow-rose-900/20'
                      : 'bg-white/[0.08] [html.light-theme_&]:bg-black/[0.05] border-white/15 [html.light-theme_&]:border-black/10 text-white [html.light-theme_&]:text-slate-900'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                    {isAdmin ? <Crown className="w-3 h-3 text-white" /> : user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-extrabold hidden sm:inline-block max-w-[70px] truncate">
                    {isAdmin ? 'Admin' : user?.name}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {/* Dynamic RBAC Dropdown Menu - Solid frosted glass surface with elevated z-index */}
                {isUserMenuOpen && (
                  <div
                    className="!absolute top-full right-0 mt-2.5 w-64 rounded-2xl bg-[#0a101f]/95 [html.light-theme_&]:bg-white/95 border border-white/20 [html.light-theme_&]:border-slate-200 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.85)] [html.light-theme_&]:shadow-2xl z-[110] text-xs space-y-1 backdrop-blur-2xl animate-fadeIn"
                    style={{ position: 'absolute' }}
                  >
                    {/* User Profile Header */}
                    <div className="p-2.5 border-b border-white/10 [html.light-theme_&]:border-slate-200 mb-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-white [html.light-theme_&]:text-slate-900 truncate min-w-0 flex-1">
                          {user?.name}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-extrabold uppercase text-[9px] flex-shrink-0 ${
                            isAdmin ? 'bg-rose-600/20 text-rose-400 [html.light-theme_&]:text-rose-600 border border-rose-500/30' : 'bg-white/10 text-white [html.light-theme_&]:text-slate-800'
                          }`}
                        >
                          {user?.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 [html.light-theme_&]:text-slate-500 truncate mt-1">
                        {user?.email || user?.phone}
                      </div>
                    </div>

                    {isAdmin ? (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-white [html.light-theme_&]:text-slate-900 font-bold transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-rose-400 [html.light-theme_&]:text-rose-600" />
                          <span>Admin Control Center</span>
                        </Link>
                        <Link
                          href="/admin?tab=games"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors"
                        >
                          <Gamepad2 className="w-4 h-4 text-rose-400 [html.light-theme_&]:text-rose-600" />
                          <span>Manage Games & Packages</span>
                        </Link>
                        <Link
                          href="/admin?tab=orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors"
                        >
                          <Package className="w-4 h-4 text-emerald-400" />
                          <span>Manage Live Orders</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-white [html.light-theme_&]:text-slate-900 font-bold transition-colors"
                        >
                          <Package className="w-4 h-4 text-rose-400 [html.light-theme_&]:text-rose-600" />
                          <span>My Orders & Invoices</span>
                        </Link>
                        <Link
                          href="/wallet"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          <span>My Gamer Wallet (৳{user?.walletBalance || 0})</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-white/10 [html.light-theme_&]:border-black/10 pt-1 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-red-500/20 text-red-400 font-bold transition-colors text-left cursor-pointer"
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

      {/* Global Apple Spotlight Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        games={games}
      />
    </>
  );
}
