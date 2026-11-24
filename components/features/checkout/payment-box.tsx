'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteSettings, CouponItem } from '@/lib/types';
import { Copy, Check, Truck, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useClipboard } from '@/hooks/use-clipboard';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';

interface PaymentBoxProps {
  settings: SiteSettings;
  subtotal: number;
  appliedCoupon: CouponItem | null;
  onApplyCoupon: (code: string) => void;
  onSubmitOrder: (method: 'bKash' | 'Nagad' | 'Wallet', lastDigits: string) => void;
  isSubmitting: boolean;
}

export function PaymentBox({
  settings,
  subtotal,
  appliedCoupon,
  onApplyCoupon,
  onSubmitOrder,
  isSubmitting,
}: PaymentBoxProps) {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Wallet'>('bKash');
  const [lastDigits, setLastDigits] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const { copy, hasCopied } = useClipboard();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const num = method === 'bKash' ? settings.bkashNumber : settings.nagadNumber;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const walletBalance = user?.walletBalance || 0;
  const hasEnoughWallet = walletBalance >= grandTotal;

  const canSubmit =
    !isSubmitting &&
    subtotal > 0 &&
    (method === 'Wallet' ? (isAuthenticated && hasEnoughWallet) : Boolean(lastDigits && lastDigits.trim().length >= 4));

  return (
    <Card variant="glass" className="p-6 space-y-5 sticky top-20 border-white/20">
      <div className="flex items-center gap-2.5 border-b border-white/15 pb-3">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-rose-600/30">
          ৩
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">{t('step3PaymentCheckout')}</h3>
          <p className="text-[11px] text-gray-300">{t('paymentMethod')}</p>
        </div>
      </div>

      {/* Payment Tabs: bKash, Nagad, Gamer Wallet */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setMethod('bKash')}
          className={`py-2 px-1.5 rounded-2xl border font-bold text-[11px] sm:text-xs flex items-center justify-center transition-all cursor-pointer backdrop-blur-xl ${
            method === 'bKash'
              ? 'bg-pink-600 text-white border-pink-400 shadow-xl shadow-pink-600/35 ring-2 ring-pink-500/40'
              : 'bg-white/[0.06] border-white/15 text-gray-300 hover:bg-white/[0.12]'
          }`}
        >
          {t('bkashPersonal')}
        </button>
        <button
          type="button"
          onClick={() => setMethod('Nagad')}
          className={`py-2 px-1.5 rounded-2xl border font-bold text-[11px] sm:text-xs flex items-center justify-center transition-all cursor-pointer backdrop-blur-xl ${
            method === 'Nagad'
              ? 'bg-orange-600 text-white border-orange-400 shadow-xl shadow-orange-600/35 ring-2 ring-orange-500/40'
              : 'bg-white/[0.06] border-white/15 text-gray-300 hover:bg-white/[0.12]'
          }`}
        >
          {t('nagadPersonal')}
        </button>
        <button
          type="button"
          onClick={() => setMethod('Wallet')}
          className={`py-2 px-1.5 rounded-2xl border font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer backdrop-blur-xl ${
            method === 'Wallet'
              ? 'bg-rose-600 text-white border-rose-400 shadow-xl shadow-rose-600/35 ring-2 ring-rose-500/40'
              : 'bg-white/[0.06] border-white/15 text-gray-300 hover:bg-white/[0.12]'
          }`}
        >
          <Wallet className="w-3 h-3" />
          <span>Wallet</span>
        </button>
      </div>

      {/* Conditional instructions based on payment method */}
      {method === 'Wallet' ? (
        <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/20 space-y-2 backdrop-blur-2xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300 font-bold">Available Wallet Balance:</span>
            <span className="font-mono font-black text-rose-400">৳{walletBalance}</span>
          </div>

          {!isAuthenticated ? (
            <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              Please <Link href="/login" className="underline font-bold text-white">log in</Link> to pay directly from your Gamer Wallet balance.
            </div>
          ) : !hasEnoughWallet ? (
            <div className="text-[11px] text-rose-300 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span>
                Need ৳{grandTotal - walletBalance} more to pay with wallet.{' '}
                <Link href="/wallet" className="underline font-bold text-white">Top-up Wallet</Link> or select bKash/Nagad.
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 font-bold">
              ⚡ Instant 1-Click Wallet Checkout. Funds will be atomically deducted on confirmation.
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Send Money Number Card */}
          <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/20 space-y-2 backdrop-blur-2xl">
            <div className="text-[11px] text-gray-300">
              {t('sendMoneyInstruction')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-white tracking-widest font-mono">{num}</span>
              <button
                type="button"
                onClick={() => copy(num)}
                className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{hasCopied ? t('copiedBtn') : t('copyBtn')}</span>
              </button>
            </div>
          </div>

          {/* Last Digits / TrxID Input */}
          <Input
            label={t('senderNumberLabel')}
            value={lastDigits}
            onChange={e => setLastDigits(e.target.value)}
            placeholder={t('senderNumberPlaceholder')}
            className="font-mono"
            required
          />
        </>
      )}

      {/* Coupon Box */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-300 block">{t('couponCodeLabel')}</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
            placeholder={t('couponPlaceholder')}
            className="flex-1 py-2 px-3 rounded-2xl bg-white/[0.06] border border-white/20 text-xs text-white uppercase placeholder:text-gray-400 focus:outline-none focus:border-rose-500/70 backdrop-blur-xl font-mono"
          />
          <Button
            variant="glass"
            size="sm"
            onClick={() => onApplyCoupon(couponCode)}
            disabled={!couponCode}
          >
            {t('applyCoupon')}
          </Button>
        </div>
        {appliedCoupon && (
          <p className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
            ✓ {appliedCoupon.code} - {t('couponApplied')} (-{formatCurrency(appliedCoupon.discount)})
          </p>
        )}
      </div>

      {/* Bill Breakdown */}
      <div className="space-y-2 border-t border-white/15 pt-3 text-xs">
        <div className="flex justify-between text-gray-300">
          <span>{t('subtotal')}</span>
          <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-300">
            <span>{t('discount')}</span>
            <span className="font-bold">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black text-white border-t border-white/15 pt-2">
          <span>{t('totalToPay')}</span>
          <span className="text-emerald-300 text-base">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={() => onSubmitOrder(method, method === 'Wallet' ? 'WALLET' : lastDigits)}
        disabled={!canSubmit}
        loading={isSubmitting}
        className="w-full"
        icon={<Truck className="w-4 h-4" />}
      >
        {isSubmitting
          ? t('placingOrder')
          : method === 'Wallet'
          ? `Pay ৳${grandTotal} from Wallet`
          : t('placeOrderNow')}
      </Button>
    </Card>
  );
}
