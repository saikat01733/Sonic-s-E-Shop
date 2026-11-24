'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Sun, Moon, ShieldCheck, X, Zap, ChevronRight, Package, Gamepad2 } from 'lucide-react';
import { GameItem, PackageItem, SiteSettings } from '@/lib/types';

interface NavbarProps {
  settings: SiteSettings;
  games: GameItem[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectGame: (gameId: string) => void;
  onSelectPackage: (gameId: string, pkg: PackageItem) => void;
}

export default function Navbar({
  settings,
  games,
  theme,
  onToggleTheme,
  onSelectGame,
  onSelectPackage,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = searchQuery.trim().toLowerCase();

  // Matched games
  const matchedGames = q
    ? games.filter(
        g =>
          g.name.toLowerCase().includes(q) ||
          (g.name_bn && g.name_bn.toLowerCase().includes(q)) ||
          g.category_name.toLowerCase().includes(q)
      )
    : [];

  // Matched packages
  const matchedPackages: { game: GameItem; pkg: PackageItem }[] = [];
  if (q) {
    games.forEach(g => {
      g.packages.forEach(p => {
        if (
          p.name.toLowerCase().includes(q) ||
          `${g.name} ${p.name}`.toLowerCase().includes(q) ||
          (p.price && String(p.price).includes(q))
        ) {
          matchedPackages.push({ game: g, pkg: p });
        }
      });
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-gray-200 to-red-400 bg-clip-text text-transparent">
              {settings.siteName || "SONIC'S E-SHOP"}
            </span>
            <span className="text-[10px] text-red-400 font-semibold tracking-widest uppercase -mt-1">
              GAME TOP-UP BD
            </span>
          </div>
        </Link>

        {/* Global Live Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="সার্চ করুন গেম বা প্যাকেজ (যেমন: PUBG, UC, Coins)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-md text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel bg-[#0d111a]/95 border border-white/15 shadow-2xl p-3 z-50 max-h-96 overflow-y-auto">
              {!q ? (
                <div>
                  <div className="text-xs font-semibold text-gray-400 px-2 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> জনপ্রিয় গেমসমূহ
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {games.map(g => (
                      <button
                        key={g.id}
                        onClick={() => {
                          onSelectGame(g.id);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={g.poster}
                            alt={g.name}
                            className="w-8 h-8 rounded-lg object-cover"
                            onError={(e: any) => (e.target.src = '/banner.jpg')}
                          />
                          <div>
                            <div className="text-xs font-bold text-white">{g.name}</div>
                            <div className="text-[10px] text-gray-400">{g.delivery_time} ডেলিভারি</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${g.badge_color}25`, color: g.badge_color }}>
                          {g.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : matchedGames.length === 0 && matchedPackages.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs">
                  <p>"{searchQuery}" দিয়ে কোনো গেম বা প্যাকেজ পাওয়া যায়নি!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedGames.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 px-1 mb-1.5 flex items-center gap-1">
                        <Gamepad2 className="w-3.5 h-3.5 text-red-400" /> গেমসমূহ ({matchedGames.length})
                      </div>
                      {matchedGames.map(g => (
                        <div
                          key={g.id}
                          onClick={() => {
                            onSelectGame(g.id);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={g.poster}
                              alt={g.name}
                              className="w-9 h-9 rounded-lg object-cover"
                              onError={(e: any) => (e.target.src = '/banner.jpg')}
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{g.name}</div>
                              <div className="text-[10px] text-emerald-400 font-medium">⚡ {g.delivery_time}</div>
                            </div>
                          </div>
                          <button className="text-xs px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors font-semibold">
                            টপ-আপ
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedPackages.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 px-1 mb-1.5 flex items-center gap-1 border-t border-white/10 pt-2">
                        <Package className="w-3.5 h-3.5 text-cyan-400" /> প্যাকেজসমূহ ({matchedPackages.length})
                      </div>
                      {matchedPackages.slice(0, 8).map(({ game, pkg }) => (
                        <div
                          key={`${game.id}-${pkg.id}`}
                          onClick={() => {
                            onSelectPackage(game.id, pkg);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{pkg.icon || '🪙'}</span> {pkg.name}
                              <span className="text-[10px] text-gray-400 font-normal">({game.name})</span>
                            </div>
                            <div className="text-[11px] text-emerald-400 font-bold">
                              {pkg.price ? `৳${pkg.price}` : '৳***'}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${pkg.stock ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {pkg.stock ? 'সিলেক্ট' : 'স্টক শেষ'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            title="থিম পরিবর্তন করুন"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Admin Panel Access Button */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অ্যাডমিন</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
