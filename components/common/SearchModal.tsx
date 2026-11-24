'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Zap, ArrowRight, Gamepad2, Sparkles, Command } from 'lucide-react';
import { GameItem } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameItem[];
}

export default function SearchModal({ isOpen, onClose, games }: SearchModalProps) {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K and ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();
  const filteredGames = q
    ? games.filter(
        g =>
          g.name.toLowerCase().includes(q) ||
          (g.name_bn && g.name_bn.toLowerCase().includes(q)) ||
          g.category_name.toLowerCase().includes(q) ||
          g.slug.toLowerCase().includes(q)
      )
    : games;

  const handleSelectGame = (slug: string) => {
    router.push(`/games/${slug}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-14 sm:pt-24 px-3 sm:px-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-xl rounded-3xl bg-[#071322]/95 [html.light-theme_&]:bg-white/95 border border-white/15 [html.light-theme_&]:border-black/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden z-10"
          >
            {/* Top Search Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-white/10 [html.light-theme_&]:border-black/10">
              <Search className="w-5 h-5 text-rose-400 mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-transparent text-sm sm:text-base text-white [html.light-theme_&]:text-slate-900 placeholder-gray-400 [html.light-theme_&]:placeholder-slate-400 focus:outline-none"
              />
              {query ? (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-gray-400 hover:text-white [html.light-theme_&]:hover:text-black hover:bg-white/10 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono">
                  <span>ESC</span>
                </div>
              )}
            </div>

            {/* Results / Suggestions Area */}
            <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-3 space-y-2">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-gray-400 [html.light-theme_&]:text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
                  {q ? `${filteredGames.length} ${t('navGames')}` : t('popularGames')}
                </span>
                <span className="text-[10px] text-gray-500 font-normal">Instant Top-Up</span>
              </div>

              {filteredGames.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-gray-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-300 [html.light-theme_&]:text-slate-700">{t('noResults')}</p>
                  <p className="text-xs text-gray-500">Try searching for PUBG, eFootball, or Roblox</p>
                </div>
              ) : (
                filteredGames.map(game => (
                  <button
                    key={game.id}
                    onClick={() => handleSelectGame(game.slug)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] [html.light-theme_&]:bg-black/[0.03] [html.light-theme_&]:hover:bg-black/[0.06] border border-transparent hover:border-rose-500/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={game.poster}
                        alt={game.name}
                        className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0"
                        onError={(e: any) => (e.target.src = '/assets/pubg.jpg')}
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white [html.light-theme_&]:text-slate-900 group-hover:text-rose-400 [html.light-theme_&]:group-hover:text-rose-600 transition-colors">
                          {locale === 'bn' && game.name_bn ? game.name_bn : game.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> {game.delivery_time}
                          </span>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-[10px] text-gray-300 [html.light-theme_&]:text-slate-500">{game.category_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400">
                        {game.badge}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-rose-600/20 text-gray-400 group-hover:text-rose-400 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-gray-300">ESC</span> to close
              </span>
              <span className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-gray-300">↵</span> to select
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
