'use client';

import React, { useState } from 'react';
import { PackageItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

interface PackageSelectorProps {
  packages: PackageItem[];
  selectedPackages: PackageItem[];
  onTogglePackage: (pkg: PackageItem) => void;
}

export function PackageSelector({ packages, selectedPackages, onTogglePackage }: PackageSelectorProps) {
  const [search, setSearch] = useState('');
  const { t } = useLanguage();

  const filtered = packages.filter(
    p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.price && String(p.price).includes(search))
  );

  return (
    <Card variant="glass" className="p-6 space-y-4 border-white/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-red-600/30">
            ২
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">{t('step2PackageSelection')}</h3>
            <p className="text-[11px] text-gray-300">Choose your desired in-game amount</p>
          </div>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-8 pr-3 py-1.5 rounded-2xl bg-white/[0.08] border border-white/20 text-xs text-white focus:outline-none focus:border-red-500/70 backdrop-blur-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map(pkg => {
          const isSelected = Boolean(selectedPackages.find(p => p.id === pkg.id));

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onTogglePackage(pkg)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer backdrop-blur-2xl ${
                isSelected
                  ? 'bg-gradient-to-br from-red-600/30 to-amber-600/20 border-red-500/80 shadow-[0_0_20px_rgba(255,42,75,0.35)] ring-2 ring-red-500/50 scale-102'
                  : 'bg-white/[0.06] border-white/15 hover:border-white/35 hover:bg-white/[0.12]'
              } ${!pkg.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{pkg.icon || '🪙'}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    pkg.stock ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30' : 'text-red-300 bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  {pkg.stock ? t('inStock') : t('outOfStock')}
                </span>
              </div>

              <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                {pkg.name}
              </div>

              <div className="text-sm font-black text-emerald-300 mt-1">
                {formatCurrency(pkg.price)}
              </div>

              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-lg font-bold">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
