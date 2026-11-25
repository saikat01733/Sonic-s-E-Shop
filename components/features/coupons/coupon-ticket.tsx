'use client';

import React from 'react';
import Link from 'next/link';
import { CouponItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useClipboard } from '@/hooks/use-clipboard';
import { useLanguage } from '@/hooks/use-language';
import { Check, Copy, Tag } from 'lucide-react';

interface CouponTicketProps {
  coupon: CouponItem;
  onCopyNotice?: (code: string) => void;
}

export function CouponTicket({ coupon, onCopyNotice }: CouponTicketProps) {
  const { copy, hasCopied } = useClipboard();
  const { t } = useLanguage();

  const handleCopy = () => {
    copy(coupon.code);
    if (onCopyNotice) onCopyNotice(coupon.code);
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-white/15 [html.light-theme_&]:border-slate-300/80 bg-white/[0.04] [html.light-theme_&]:bg-white/80 backdrop-blur-xl p-3.5 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/20">
      {/* Decorative Perforated Ticket Notches */}
      <div className="coupon-notch-left" />
      <div className="coupon-notch-right" />

      {/* Header: Discount Badge & Min Spend */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 [html.light-theme_&]:text-emerald-700 border border-emerald-500/30">
          <Tag className="w-3 h-3" />
          <span>{formatCurrency(coupon.discount)} {t('discount')}</span>
        </span>
        <span className="text-[10px] text-gray-400 [html.light-theme_&]:text-slate-600 font-bold whitespace-nowrap">
          {t('minSpendText')} {formatCurrency(coupon.minSpend)}
        </span>
      </div>

      {/* Code & 1-Click Copy Bar */}
      <div className="flex items-center justify-between gap-2 bg-white/[0.06] [html.light-theme_&]:bg-slate-100 p-1.5 pl-3 rounded-xl border border-white/10 [html.light-theme_&]:border-slate-200">
        <span className="font-mono font-black text-sm tracking-wider text-white [html.light-theme_&]:text-slate-900 truncate">
          {coupon.code}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
            hasCopied
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950/30'
          }`}
        >
          {hasCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>{t('copiedBtn')}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-white" />
              <span>{t('copyCode')}</span>
            </>
          )}
        </button>
      </div>

      {/* Footer: 1-line Description & Browse link */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10 [html.light-theme_&]:border-slate-200/80 text-[10px] text-gray-400 [html.light-theme_&]:text-slate-600">
        <p className="line-clamp-1 flex-1 leading-tight">{coupon.description}</p>
        <Link
          href="/games"
          className="text-rose-400 hover:text-rose-300 [html.light-theme_&]:text-rose-600 font-bold whitespace-nowrap transition-colors flex-shrink-0"
        >
          {t('browseGames')} →
        </Link>
      </div>
    </div>
  );
}
