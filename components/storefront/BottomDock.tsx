'use client';

import React from 'react';
import { Home, Tag, Package, User } from 'lucide-react';

interface BottomDockProps {
  activeTab: 'home' | 'codes' | 'orders' | 'account';
  onSelectTab: (tab: 'home' | 'codes' | 'orders' | 'account') => void;
}

export default function BottomDock({ activeTab, onSelectTab }: BottomDockProps) {
  const tabs = [
    { id: 'home', label: 'হোম শপ', icon: Home },
    { id: 'codes', label: 'কুপন কোড', icon: Tag },
    { id: 'orders', label: 'অর্ডারস', icon: Package },
    { id: 'account', label: 'একাউন্ট', icon: User },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden glass-panel bg-[#090c13]/90 backdrop-blur-xl border-t border-white/10 px-4 py-2">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
