'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import FloatingToast, { ToastMessage } from '@/components/storefront/FloatingToast';
import { SiteSettings, GameItem } from '@/lib/types';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard, RefreshCw, Copy, Check } from 'lucide-react';

export default function WalletPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0.00);
  const [addAmount, setAddAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
    setToast({
      id: String(Date.now()),
      title: 'নম্বর কপি হয়েছে!',
      desc: `${paymentMethod} নম্বর (${num}) ক্লিপবোর্ডে কপি করা হয়েছে!`,
      icon: '📋'
    });
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      setToast({
        id: String(Date.now()),
        title: 'TrxID দিন',
        desc: 'অনুগ্রহ করে পেমেন্ট সম্পন্ন করার পর TrxID লিখুন!',
        icon: '⚠️'
      });
      return;
    }

    const amt = parseFloat(addAmount) || 0;
    const newBal = walletBalance + amt;
    setWalletBalance(newBal);
    localStorage.setItem('sonic_wallet_balance', String(newBal));
    setShowAddModal(false);
    setTrxId('');

    setToast({
      id: String(Date.now()),
      title: 'ওয়ালেটে টাকা যোগ হয়েছে!',
      desc: `আপনার একাউন্টে ৳${amt} সফলভাবে জমা করা হয়েছে!`,
      icon: '🎉'
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings || undefined} games={games} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 mt-8 w-full space-y-8">
        {/* Wallet Balance Hero Card */}
        <div className="liquid-glass p-8 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold text-xs">
              <Wallet className="w-3.5 h-3.5" />
              <span>ডিজিটাল গেমার ওয়ালেট</span>
            </div>
            <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              ৳{walletBalance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              ১-ট্যাপ ইনস্ট্যান্ট টপ-আপ এবং রিওয়ার্ড ব্যবহারের জন্য প্রস্তুত ব্যালেন্স
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-xl shadow-red-600/30 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>টাকা যোগ করুন (Add Money)</span>
          </button>
        </div>

        {/* Benefits Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="liquid-glass p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-white">ইনস্ট্যান্ট পেমেন্ট</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              কোনো TrxID দেওয়া ছাড়াই ওয়ালেট থেকে সরাসরি ১ ক্লিকে গেম টপ-আপ করুন।
            </p>
          </div>

          <div className="liquid-glass p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-white">ক্যাশব্যাক রিওয়ার্ড</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              প্রতিবার ওয়ালেটে টাকা যোগ করলে পাচ্ছেন আকর্ষণীয় বোনাস ও পয়েন্ট।
            </p>
          </div>

          <div className="liquid-glass p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-white">২৪/৭ রিফান্ড গ্যারান্টি</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              যেকোনো ব্যর্থ অর্ডারে তৎক্ষণাৎ ওয়ালেটে ১০০% সম্পূর্ণ রিফান্ড।
            </p>
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddModal && settings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl liquid-glass bg-[#0d111a] border border-white/20 p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white">ওয়ালেটে টাকা যোগ করুন</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                {/* Amount Quick Select */}
                <div>
                  <label className="text-gray-300 font-bold block mb-1.5">টাকার পরিমাণ নির্বাচন করুন</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['200', '500', '1000', '2000'].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAddAmount(amt)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          addAmount === amt
                            ? 'bg-red-500 text-white border-red-500 shadow-md'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method Switcher */}
                <div>
                  <label className="text-gray-300 font-bold block mb-1.5">পেমেন্ট মেথড</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bKash')}
                      className={`py-2.5 rounded-xl border font-bold text-xs ${
                        paymentMethod === 'bKash' ? 'bg-pink-600 text-white border-pink-500' : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      বিকাশ
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Nagad')}
                      className={`py-2.5 rounded-xl border font-bold text-xs ${
                        paymentMethod === 'Nagad' ? 'bg-amber-600 text-white border-amber-500' : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      নগদ
                    </button>
                  </div>
                </div>

                {/* Send Money Details */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-gray-400">{paymentMethod} Personal Send Money:</div>
                    <div className="text-sm font-black text-white font-mono mt-0.5">
                      {paymentMethod === 'bKash' ? settings.bkashNumber : settings.nagadNumber}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-white flex items-center gap-1"
                  >
                    {copiedNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedNumber ? 'কপি' : 'কপি করুন'}</span>
                  </button>
                </div>

                {/* TrxID Input */}
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Transaction ID (TrxID) <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value.toUpperCase())}
                    placeholder="e.g. 9J1827Z"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono uppercase focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all"
                >
                  জমা সম্পন্ন করুন (৳{addAmount})
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings || undefined} />

      <FloatingToast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
