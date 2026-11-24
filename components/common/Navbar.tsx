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
      <header className="sticky top-2 z-50 w-full px-2 sm:px-4 md:px-6 mb-2">
        <div className="max-w-6xl mx-auto liquid-glass-pill py-1.5 sm:py-2 px-2.5 sm:px-5 flex items-center justify-between gap-1.5 sm:gap-4 shadow-2xl flex-nowrap">
          {/* Brand Logo - STRICT 1-LINE HORIZONTAL ALIGNMENT (320px-1440px) */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[oklch(45.5%_0.188_13.697)] flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-[oklch(45.5%_0.188_13.697_/_0.4)] group-hover:scale-105 transition-transform flex-shrink-0">
              ⚡
            </div>
            <span className="font-extrabold tracking-tight text-[11px] sm:text-sm text-white [html.light-theme_&]:text-slate-900 flex-shrink-0">
              <span className="inline sm:hidden">Sonic&apos;s</span>
              <span className="hidden sm:inline">{settings?.siteName || t('siteName')}</span>
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
                      ? 'bg-[oklch(45.5%_0.188_13.697)] text-white shadow-lg shadow-[oklch(45.5%_0.188_13.697_/_0.35)] border border-[oklch(55%_0.20_13.697_/_0.4)]'
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
              className="p-1.5 sm:p-2 rounded-full bg-white/[0.08] [html.light-theme_&]:bg-black/[0.04] hover:bg-white/[0.16] [html.light-theme_&]:hover:bg-black/[0.08] border border-white/10 [html.light-theme_&]:border-black/10 text-[oklch(65%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)] transition-all cursor-pointer flex-shrink-0 hover:scale-105 active:scale-95 shadow-sm"
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
              <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[oklch(65%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)] flex-shrink-0" />
              <span className={locale === 'en' ? 'text-[oklch(65%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)] font-black' : 'text-gray-400 [html.light-theme_&]:text-slate-500'}>EN</span>
              <span className="text-gray-500 [html.light-theme_&]:text-slate-400 text-[8px] sm:text-[10px]">|</span>
              <span className={locale === 'bn' ? 'text-[oklch(65%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)] font-black' : 'text-gray-400 [html.light-theme_&]:text-slate-500'}>বাং</span>
            </button>

            {/* Theme Switcher - Desktop & Tablet */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-1.5 sm:p-2 rounded-full bg-white/[0.08] [html.light-theme_&]:bg-black/[0.04] hover:bg-white/[0.16] [html.light-theme_&]:hover:bg-black/[0.08] border border-white/10 [html.light-theme_&]:border-black/10 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors cursor-pointer flex-shrink-0"
              title="Theme Toggle"
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[oklch(70%_0.18_13.697)]" />
              ) : (
                <Moon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[oklch(45.5%_0.188_13.697)]" />
              )}
            </button>

            {/* RBAC Authentication Button & Dropdown */}
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[oklch(45.5%_0.188_13.697)] hover:bg-[oklch(52%_0.20_13.697)] text-white text-[10px] sm:text-xs font-black transition-all cursor-pointer shadow-md shadow-[oklch(45.5%_0.188_13.697_/_0.35)] border border-[oklch(60%_0.18_13.697_/_0.4)] flex-shrink-0 hover:scale-105 active:scale-95"
                title="Login / লগইন"
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{locale === 'bn' ? 'লগইন' : 'Login'}</span>
              </Link>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-1 sm:gap-1.5 py-1 px-2 sm:px-2.5 rounded-full border transition-all cursor-pointer flex-shrink-0 ${
                    isAdmin
                      ? 'bg-[oklch(45.5%_0.188_13.697_/_0.2)] border-[oklch(45.5%_0.188_13.697_/_0.5)] text-[oklch(65%_0.20_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)] shadow-md shadow-[oklch(45.5%_0.188_13.697_/_0.2)]'
                      : 'bg-white/[0.08] [html.light-theme_&]:bg-black/[0.05] border-white/15 [html.light-theme_&]:border-black/10 text-white [html.light-theme_&]:text-slate-900'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-[oklch(45.5%_0.188_13.697)] flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                    {isAdmin ? <Crown className="w-3 h-3 text-white" /> : user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-extrabold hidden sm:inline-block max-w-[70px] truncate">
                    {isAdmin ? 'Admin' : user?.name}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {/* Dynamic RBAC Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl liquid-glass bg-[#08172e]/95 [html.light-theme_&]:bg-white/95 border border-[oklch(45.5%_0.188_13.697_/_0.35)] [html.light-theme_&]:border-black/10 p-2 shadow-2xl z-50 text-xs space-y-1 backdrop-blur-3xl animate-fadeIn">
                    {/* User Profile Header */}
                    <div className="p-2 border-b border-white/10 [html.light-theme_&]:border-black/10 mb-1">
                      <div className="font-bold text-white [html.light-theme_&]:text-slate-900 truncate">{user?.name}</div>
                      <div className="text-[10px] text-gray-400 [html.light-theme_&]:text-slate-500 flex items-center justify-between mt-0.5">
                        <span>{user?.phone}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full font-extrabold uppercase text-[9px] ${
                            isAdmin ? 'bg-[oklch(45.5%_0.188_13.697_/_0.2)] text-[oklch(65%_0.20_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)]' : 'bg-white/10 text-white [html.light-theme_&]:text-slate-800'
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
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-white [html.light-theme_&]:text-slate-900 font-bold transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[oklch(65%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)]" />
                          <span>Admin CMS Dashboard</span>
                        </Link>
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors"
                        >
                          <Gamepad2 className="w-4 h-4 text-[oklch(65%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)]" />
                          <span>Manage Games & Packages</span>
                        </Link>
                        <Link
                          href="/admin"
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
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-white [html.light-theme_&]:text-slate-900 font-bold transition-colors"
                        >
                          <User className="w-4 h-4 text-[oklch(65%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)]" />
                          <span>My Account Profile</span>
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors"
                        >
                          <Package className="w-4 h-4 text-[oklch(65%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)]" />
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
