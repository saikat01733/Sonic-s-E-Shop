'use client';

import React from 'react';
import Link from 'next/link';
import { SiteSettings } from '@/lib/types';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface FooterProps {
  settings?: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-white/15 liquid-glass rounded-t-3xl pt-10 pb-24 sm:pb-12 text-xs text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                ⚡
              </div>
              <span className="font-extrabold text-sm text-white">
                {settings?.siteName || t('siteName')}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              {t('tagline')}. Official eFootball Coins, PUBG Mobile UC, and Roblox Robux instant top-up in Bangladesh.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('quickLinks')}</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">{t('navHome')}</Link></li>
              <li><Link href="/games" className="hover:text-white transition-colors">{t('navGames')}</Link></li>
              <li><Link href="/coupons" className="hover:text-white transition-colors">{t('navCoupons')}</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">{t('navOrders')}</Link></li>
              <li><Link href="/wallet" className="hover:text-white transition-colors">{t('navWallet')}</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Top-Ups */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('popularTopups')}</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/games/efootball-coin" className="hover:text-red-400 transition-colors">eFootball™ Coins Top-Up</Link></li>
              <li><Link href="/games/pubg-mobile-uc" className="hover:text-amber-400 transition-colors">PUBG Mobile UC Top-Up</Link></li>
              <li><Link href="/games/roblox-robux" className="hover:text-cyan-400 transition-colors">Roblox Robux Top-Up</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">{t('navAccount')}</Link></li>
            </ul>
          </div>

          {/* Col 4: 24/7 Helpline & Payments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('customerSupport')}</h4>
            <a
              href={settings?.whatsappUrl || "https://wa.me/8801733185830"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: {settings?.supportPhone || "01733185830"}</span>
            </a>
            <div className="pt-2 text-[11px] text-gray-300">
              {t('paymentPartners')}
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-white/15 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400">
          <div>
            © 2026 {settings?.siteName || t('siteName')}. {t('allRightsReserved')}
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span>{t('builtBy')}</span>
            <strong className="text-white">md-asif-iqbal</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
