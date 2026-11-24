'use client';

import React from 'react';
import { TrustBadge } from '@/lib/types';
import { ShieldCheck, Zap, Headphones, Users } from 'lucide-react';

interface TrustBadgesProps {
  badges: TrustBadge[];
}

export default function TrustBadges({ badges }: TrustBadgesProps) {
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'headset':
        return <Headphones className="w-5 h-5 text-cyan-400" />;
      case 'users':
        return <Users className="w-5 h-5 text-purple-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {badges.map(b => (
          <div
            key={b.id}
            className="glass-panel rounded-2xl p-3 flex items-center gap-3 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              {getIcon(b.icon)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{b.title}</div>
              <div className="text-[10px] text-gray-400 truncate">{b.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
