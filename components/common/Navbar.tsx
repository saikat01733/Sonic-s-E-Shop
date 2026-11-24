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
      <header className="sticky top-2 z-50 w-full px-2 sm:px-4 md:px-6">
        <div className="max-w-6xl mx-auto liquid-glass-pill py-1.5 sm:py-2 px-2 sm:px-5 flex items-center justify-between gap-1 sm:gap-4 shadow-2xl flex-nowrap">
          {/* Brand Logo - STRICT 1-LINE HORIZONTAL ALIGNMENT (320px-1440px) */}
          <Link href="/" className="flex items-center gap-1.5 group flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
              ⚡
            </div>
            <span className="font-extrabold tracking-tight text-[11px] sm:text-sm bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent max-w-[85px] xs:max-w-none truncate sm:overflow-visible">
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
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-600/35 border border-cyan-400/40'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Spotlight Pill Button */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-gray-300 hover:text-white transition-all cursor-pointer shadow-inner group flex-shrink-0"
            title="Search Games (⌘K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-gray-400 font-medium">{t('searchPlaceholder')}</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-gray-300 border border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Right Action Controls: Search (mobile) + Language Toggle + Theme + Auth */}
          <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0">
            {/* Mobile / Tablet Compact Search Icon Button */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="md:hidden p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.15] border border-white/10 text-cyan-400 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Open Search Modal"
              title="Search Games"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Bilingual Switcher (EN | বাং) */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.15] border border-white/10 text-white text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer shadow-sm flex-shrink-0"
              title="Switch Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 flex-shrink-0" />
              <span className={locale === 'en' ? 'text-cyan-300' : 'text-gray-400'}>EN</span>
              <span className="text-gray-500 text-[8px] sm:text-[10px]">|</span>
              <span className={locale === 'bn' ? 'text-cyan-300' : 'text-gray-400'}>বাং</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-1 sm:p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.15] border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
              title="Theme Toggle"
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-300" />
              ) : (
                <Moon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400" />
              )}
            </button>

            {/* RBAC Authentication Button & Dropdown */}
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="flex items-center gap-1 p-1 xs:px-2.5 xs:py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer shadow-sm shadow-cyan-600/30 flex-shrink-0"
                title="Sign In"
              >
                <User className="w-3 h-3" />
                <span className="hidden xs:inline">Sign In</span>
              </Link>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-1 sm:gap-1.5 py-1 px-2 sm:px-2.5 rounded-full border transition-all cursor-pointer flex-shrink-0 ${
                    isAdmin
                      ? 'bg-blue-500/20 border-cyan-400/50 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-white/[0.08] border-white/15 text-white'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                    {isAdmin ? <Crown className="w-3 h-3 text-cyan-300" /> : user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-extrabold hidden sm:inline-block max-w-[70px] truncate">
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
                        <span
                          className={`px-1.5 py-0.2 rounded-full font-extrabold uppercase text-[9px] ${
                            isAdmin ? 'bg-cyan-400/20 text-cyan-300' : 'bg-blue-400/20 text-blue-300'
                          }`}
                        >
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
                          <LayoutDashboard className="w-4 h-4 text-cyan-400" />
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
                          <Package className="w-4 h-4 text-blue-400" />
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

      {/* Global Apple Spotlight Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        games={games}
      />
    </>
  );
}
