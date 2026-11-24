'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Palette,
  Gamepad2,
  Package,
  Tag,
  ShoppingBag,
  History,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'site_cms'
  | 'games'
  | 'packages'
  | 'coupons'
  | 'orders'
  | 'history'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingOrdersCount: number;
  onLogout: () => void;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  pendingOrdersCount,
  onLogout,
}: AdminSidebarProps) {
  const menuItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড (Overview)', icon: LayoutDashboard },
    { id: 'site_cms', label: 'সাইট ব্র্যান্ডিং ও টিকার', icon: Palette },
    { id: 'games', label: 'গেম ক্যাটালগ (CRUD)', icon: Gamepad2 },
    { id: 'packages', label: 'প্যাকেজ ও মূল্য তালিকা', icon: Package },
    { id: 'coupons', label: 'কুপন ও বিশেষ ছাড়', icon: Tag },
    { id: 'orders', label: 'অর্ডারস হাব (Orders)', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'history', label: 'অডিট হিস্ট্রি লগ', icon: History },
    { id: 'settings', label: 'অ্যাডমিন সেটিংস', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 liquid-glass bg-[#0b0e17]/95 border-r border-white/10 flex flex-col justify-between flex-shrink-0">
      <div>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-black text-white">Sonic CMS</h1>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                MongoDB & Firebase
              </div>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            title="লাইভ শপ দেখুন"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-extrabold text-[10px]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>লগআউট করুন</span>
        </button>
      </div>
    </aside>
  );
}
