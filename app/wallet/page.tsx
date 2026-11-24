'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FloatingToast from '@/components/common/FloatingToast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { SiteSettings, GameItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Plus, ShieldCheck, RefreshCw, Copy, Check, Zap, Sparkles } from 'lucide-react';

export default function WalletPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0.00);
  const [addAmount, setAddAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const { toast, showToast, dismissToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/api/site-data')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setGames(json.data.games);
          setSettings(json.data.settings);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const savedBal = localStorage.getItem('sonic_wallet_balance');
    if (savedBal) setWalletBalance(parseFloat(savedBal));
  }, []);

  const handleCopy = () => {
    if (!settings) return;
    const num = paymentMethod === 'bKash' ? settings.bkashNumber : settings.nagadNumber;
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
    showToast(t('copiedBtn'), `${paymentMethod}: ${num}`, '📋');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      showToast('Enter TrxID', 'Please enter your transaction ID after sending money.', '⚠️');
      return;
    }

    const amt = parseFloat(addAmount) || 0;
    const newBal = walletBalance + amt;
    setWalletBalance(newBal);
    localStorage.setItem('sonic_wallet_balance', String(newBal));
    setShowAddModal(false);
    setTrxId('');
    showToast('Funds Added Successfully!', `৳${amt} added to your Sonic Wallet.`, '💳');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings || undefined} games={games} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 mt-8 w-full space-y-8 pb-12">
        {/* Header */}
        <Card variant="glass" className="p-6 sm:p-8 relative overflow-hidden border-white/20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/35 text-red-300 font-bold text-xs mb-3 backdrop-blur-md">
              <Wallet className="w-3.5 h-3.5" />
              <span>{t('navWallet')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {t('walletTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              {t('walletSubtitle')}
            </p>
          </div>
        </Card>

        {/* Balance Card */}
        <Card variant="glass" className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-white/25">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('currentBalance')}</span>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono bg-gradient-to-r from-white via-amber-200 to-emerald-400 bg-clip-text text-transparent">
              {formatCurrency(walletBalance)}
            </div>
            <p className="text-[11px] text-emerald-300 flex items-center justify-center sm:justify-start gap-1 font-bold pt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Protected & Instant Redeemable
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            {t('addMoney')}
          </Button>
        </Card>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="glass" className="p-5 space-y-2 border-white/20">
            <div className="w-9 h-9 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="text-sm font-bold text-white">{t('instantCheckoutPerk')}</h4>
            <p className="text-xs text-gray-300">Skip manual bKash/Nagad send-money steps every time.</p>
          </Card>
          <Card variant="glass" className="p-5 space-y-2 border-white/20">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              🎁
            </div>
            <h4 className="text-sm font-bold text-white">{t('cashbackPerk')}</h4>
            <p className="text-xs text-gray-300">Earn up to 5% bonus wallet credits on large deposits.</p>
          </Card>
          <Card variant="glass" className="p-5 space-y-2 border-white/20">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              👑
            </div>
            <h4 className="text-sm font-bold text-white">{t('vipPerk')}</h4>
            <p className="text-xs text-gray-300">Orders placed via wallet balance get high-priority delivery queue.</p>
          </Card>
        </div>
      </main>

      <Footer settings={settings || undefined} />

      {/* Add Money Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('addMoney')}
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          {/* Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('bKash')}
              className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'bKash'
                  ? 'bg-pink-600/80 text-white border-pink-400 shadow-lg'
                  : 'bg-white/[0.06] border-white/15 text-gray-300'
              }`}
            >
              bKash Personal
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('Nagad')}
              className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'Nagad'
                  ? 'bg-amber-600/80 text-white border-amber-400 shadow-lg'
                  : 'bg-white/[0.06] border-white/15 text-gray-300'
              }`}
            >
              Nagad Personal
            </button>
          </div>

          {/* Number Card */}
          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-between">
            <span className="font-mono text-white font-bold text-sm">
              {paymentMethod === 'bKash' ? settings?.bkashNumber : settings?.nagadNumber}
            </span>
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={handleCopy}
              icon={copiedNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            >
              {copiedNumber ? t('copiedBtn') : t('copyBtn')}
            </Button>
          </div>

          {/* Amount Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Deposit Amount (৳)</label>
            <div className="grid grid-cols-4 gap-2">
              {['200', '500', '1000', '2000'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAddAmount(amt)}
                  className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    addAmount === amt
                      ? 'bg-red-500 text-white border-red-400'
                      : 'bg-white/[0.06] border-white/15 text-gray-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Transaction ID (TrxID) *"
            value={trxId}
            onChange={e => setTrxId(e.target.value)}
            placeholder="e.g. 9J28DA10K"
            className="font-mono"
            required
          />

          <Button type="submit" variant="primary" size="md" className="w-full">
            Confirm Deposit Request
          </Button>
        </form>
      </Modal>

      <FloatingToast
        toast={toast}
        onClose={dismissToast}
      />
    </div>
  );
}
