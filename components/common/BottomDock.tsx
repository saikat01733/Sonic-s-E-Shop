'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Tag, Package, Wallet, User } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';

export default function BottomDock() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAuthenticated, isAdmin } = useAuth();

  const accountHref = isAuthenticated ? (isAdmin ? '/admin' : '/orders') : '/login';
  const accountLabel = !isAuthenticated ? 'Login' : (isAdmin ? 'Admin' : t('navOrders'));

  const navItems = [
    { href: '/', label: t('navHome'), icon: Home },
    { href: '/games', label: t('navGames'), icon: Gamepad2 },
    { href: '/coupons', label: t('navCoupons'), icon: Tag },
    { href: '/wallet', label: t('navWallet'), icon: Wallet },
    { href: accountHref, label: accountLabel, icon: User, isAccount: true },
  ];

  return (
    <nav className="fixed bottom-2.5 inset-x-0 mx-auto z-40 max-w-lg px-1 sm:px-3 pointer-events-none">
      <div className="liquid-glass-dock pointer-events-auto py-1 sm:py-1.5 px-1 sm:px-4 flex items-center justify-around gap-0 sm:gap-1 shadow-2xl border-white/10 [html.light-theme_&]:border-black/10">
        {navItems.map((item) => {
          const isActive = item.isAccount
            ? (pathname === '/login' || pathname === '/orders' || (isAdmin && pathname === '/admin'))
            : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-0.5 sm:py-1 px-1 sm:px-3 rounded-full transition-all duration-300 relative group cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40 scale-105 border border-rose-500/40'
                  : 'text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-slate-950 hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 active:scale-95'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-[7.5px] sm:text-[10px] font-bold tracking-tight mt-0.5 truncate max-w-[42px] sm:max-w-none">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
