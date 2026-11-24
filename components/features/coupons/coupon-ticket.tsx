'use client';

import React from 'react';
import Link from 'next/link';
import { CouponItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useClipboard } from '@/hooks/use-clipboard';
import { useLanguage } from '@/hooks/use-language';
import { Check, Copy } from 'lucide-react';

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
    <Card
      variant="glass"
      hoverable
      className="p-5 flex flex-col justify-between space-y-4 relative overflow-hidden border-white/20 hover:border-emerald-500/50"
    >
      <div className="coupon-notch-left" />
      <div className="coupon-notch-right" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
            {formatCurrency(coupon.discount)} {t('discount')}
          </span>
          <span className="text-[10px] text-gray-300 font-bold">
            {t('minSpendText')} {formatCurrency(coupon.minSpend)}
          </span>
        </div>

        <div className="text-lg font-black tracking-widest text-white font-mono bg-white/[0.08] py-2 px-3 rounded-2xl border border-white/20 text-center my-3 shadow-inner backdrop-blur-xl">
          {coupon.code}
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">{coupon.description}</p>
      </div>

      <div className="space-y-2 pt-2 border-t border-white/15">
        <Button
          variant={hasCopied ? 'success' : 'glass'}
          size="sm"
          onClick={handleCopy}
          className="w-full"
          icon={hasCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {hasCopied ? t('copiedBtn') : t('copyCode')}
        </Button>

        <Link
          href="/games"
          className="w-full py-1.5 rounded-xl text-[11px] font-bold text-gray-400 hover:text-white text-center block transition-colors"
        >
          {t('browseGames')} →
        </Link>
      </div>
    </Card>
  );
}
