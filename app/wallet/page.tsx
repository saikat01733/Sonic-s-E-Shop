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
import { useAuth } from '@/hooks/use-auth';
import { SiteSettings, GameItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  Plus,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  User,
  History,
  AlertCircle
} from 'lucide-react';

interface WalletTx {
  id: string;
  type: string;
  amount: number;
  balanceAfter?: number;
  description?: string;
  note?: string;
  status?: string;
  paymentMethod?: string;
  trxId?: string;
  createdAt?: string;
  timestamp?: number;
}

export default function WalletPage() {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [games, setGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Deposit Form State
  const [addAmount, setAddAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
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

    if (isAuthenticated) {
      loadTransactions();
    }
  }, [isAuthenticated]);

  const loadTransactions = async () => {
    setLoadingTx(true);
    try {
      const res = await fetch('/api/wallet/transactions');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error('Failed to load wallet transactions:', e);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleCopy = () => {
    if (!settings) return;
    const num = paymentMethod === 'bKash' ? settings.bkashNumber : settings.nagadNumber;
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
    showToast(t('copiedBtn'), `${paymentMethod}: ${num}`, '📋');
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount) || 0;
    if (amt < 50) {
      showToast('Minimum Deposit', 'Minimum top-up amount is ৳50.', '⚠️');
      return;
    }
    if (!senderNumber.trim() || senderNumber.trim().length < 11) {
      showToast('Invalid Phone', 'Please enter your 11-digit sender phone number.', '⚠️');
      return;
    }
    if (!trxId.trim() || trxId.trim().length < 6) {
      showToast('Enter TrxID', 'Please enter a valid bKash/Nagad Transaction ID.', '⚠️');
      return;
    }

    setSubmittingDeposit(true);
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          paymentMethod,
          senderNumber: senderNumber.trim(),
          trxId: trxId.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Deposit Submitted', data.message || `৳${amt} deposit request submitted!`, '✅');
        setShowAddModal(false);
        setTrxId('');
        setSenderNumber('');
        await refreshUser();
        await loadTransactions();
      } else {
        showToast('Deposit Failed', data.error || 'Failed to submit deposit request.', '❌');
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Network error submitting deposit.', '❌');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar settings={settings || undefined} games={games} />
        <main className="flex-1 max-w-md mx-auto px-4 mt-16 w-full text-center">
          <Card variant="glass" className="p-8 space-y-5 border-white/20">
            <div className="w-14 h-14 rounded-3xl bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto shadow-xl">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Gamer Wallet Login Required</h2>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Sign in to view your real wallet balance, transaction ledger, and top up instant gaming funds.
              </p>
            </div>
            <Link
              href="/login?redirect=/wallet"
              className="w-full py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In to Access Wallet</span>
            </Link>
          </Card>
        </main>
        <Footer settings={settings || undefined} />
      </div>
    );
  }

  const currentBalance = user?.walletBalance || 0;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings || undefined} games={games} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 mt-8 w-full space-y-8 pb-12">
        {/* Header */}
        <Card variant="glass" className="p-6 sm:p-8 relative overflow-hidden border-white/20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/35 text-rose-400 font-bold text-xs mb-3 backdrop-blur-md">
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
            <div className="text-4xl sm:text-5xl font-black text-white font-mono bg-gradient-to-r from-white via-rose-200 to-rose-400 bg-clip-text text-transparent">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center justify-center sm:justify-start gap-1 font-bold pt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure & Instant Checkout Guaranteed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              size="md"
              onClick={() => { refreshUser(); loadTransactions(); }}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              title="Refresh Balance"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              {t('addMoney')}
            </Button>
          </div>
        </Card>

        {/* Transaction History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-rose-500" />
              <span>Wallet Transaction History</span>
            </h3>
            <span className="text-[11px] text-gray-400 font-bold">{transactions.length} records</span>
          </div>

          {loadingTx ? (
            <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin text-rose-500 mb-2" />
              <span>Loading ledger...</span>
            </div>
          ) : transactions.length === 0 ? (
            <Card variant="glass" className="p-8 text-center border-white/10">
              <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-300">No wallet transactions recorded yet.</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Top up your wallet or place an order to see your live audit log.
              </p>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {transactions.map(tx => {
                const isCredit = tx.type === 'deposit' || tx.type === 'welcome_bonus' || tx.type === 'admin_adjustment' && tx.amount > 0;
                const isPending = tx.status === 'pending';

                return (
                  <Card
                    key={tx.id}
                    variant="glass"
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-4 border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          isPending
                            ? 'bg-amber-500/20 text-amber-400'
                            : isCredit
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isPending ? (
                          <Clock className="w-4 h-4" />
                        ) : isCredit ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{tx.description || tx.note || (isCredit ? 'Credit Top-Up' : 'Order Payment')}</span>
                          {isPending && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-2">
                          <span>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'}</span>
                          {tx.trxId && <span className="font-mono text-cyan-300">TrxID: {tx.trxId}</span>}
                          {tx.paymentMethod && <span>via {tx.paymentMethod}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm sm:text-base font-black font-mono ${
                          isCredit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCredit ? '+' : '-'}৳{tx.amount}
                      </div>
                      {typeof tx.balanceAfter === 'number' && (
                        <div className="text-[10px] text-gray-500 font-mono">
                          Bal: ৳{tx.balanceAfter}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="glass" className="p-5 space-y-2 border-white/20">
            <div className="w-9 h-9 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="text-sm font-bold text-white">{t('instantCheckoutPerk')}</h4>
            <p className="text-xs text-gray-300">Skip manual bKash/Nagad send-money steps every time.</p>
          </Card>
          <Card variant="glass" className="p-5 space-y-2 border-white/20">
            <div className="w-9 h-9 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
              🎁
            </div>
            <h4 className="text-sm font-bold text-white">{t('cashbackPerk')}</h4>
            <p className="text-xs text-gray-300">Earn up to 5% bonus wallet credits on large deposits.</p>
          </Card>
          <Card variant="glass" className="p-5 space-y-2 border-white/20">
            <div className="w-9 h-9 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold">
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
        title="Top-Up Gamer Wallet"
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          {/* Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('bKash')}
              className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                paymentMethod === 'bKash'
                  ? 'bg-pink-600 text-white border-pink-400 shadow-lg shadow-pink-900/30'
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
                  ? 'bg-orange-600 text-white border-orange-400 shadow-lg shadow-orange-900/30'
                  : 'bg-white/[0.06] border-white/15 text-gray-300'
              }`}
            >
              Nagad Personal
            </button>
          </div>

          {/* Number Card */}
          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-400">Send Money (Personal Number):</div>
              <span className="font-mono text-white font-bold text-sm">
                {paymentMethod === 'bKash' ? settings?.bkashNumber : settings?.nagadNumber}
              </span>
            </div>
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
              {['100', '300', '500', '1000'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAddAmount(amt)}
                  className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    addAmount === amt
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                      : 'bg-white/[0.06] border-white/15 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
              placeholder="Or enter custom amount (min ৳50)"
              min={50}
              className="mt-1"
            />
          </div>

          <Input
            label="Sender Phone Number (Your 11-digit bKash/Nagad Number) *"
            value={senderNumber}
            onChange={e => setSenderNumber(e.target.value)}
            placeholder="01XXXXXXXXX"
            required
          />

          <Input
            label="Transaction ID (TrxID) *"
            value={trxId}
            onChange={e => setTrxId(e.target.value)}
            placeholder="e.g. 9J28DA10K"
            className="font-mono uppercase"
            required
          />

          <Button type="submit" variant="primary" size="md" className="w-full" loading={submittingDeposit}>
            Submit Top-Up Request
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
