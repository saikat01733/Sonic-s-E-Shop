'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Tag, Package, Wallet, User } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function BottomDock() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t('navHome'), icon: Home },
    { href: '/games', label: t('navGames'), icon: Gamepad2 },
    { href: '/coupons', label: t('navCoupons'), icon: Tag },
    { href: '/orders', label: t('navOrders'), icon: Package },
    { href: '/wallet', label: t('navWallet'), icon: Wallet },
    { href: '/account', label: t('navAccount'), icon: User },
  ];

  return (
    <nav className="fixed bottom-3 inset-x-0 mx-auto z-40 max-w-lg px-3 pointer-events-none">
      <div className="liquid-glass-dock pointer-events-auto py-1.5 px-2 sm:px-4 flex items-center justify-around gap-1 shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 sm:px-3 rounded-full transition-all duration-300 relative group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/35 scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-[9px] sm:text-[10px] font-bold tracking-tight mt-0.5 truncate max-w-[55px] sm:max-w-none">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
