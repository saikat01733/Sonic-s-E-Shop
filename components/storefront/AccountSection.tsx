'use client';

import React, { useState } from 'react';
import { Lightbulb, Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function AccountSection() {
  const [isLampOn, setIsLampOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  // Cord Pull Simulation
  const handlePullCord = () => {
    setIsPulling(true);
    setTimeout(() => {
      setIsLampOn(!isLampOn);
      setIsPulling(false);
    }, 200);
  };

  return (
    <div className="max-w-md mx-auto px-4 mt-8 pb-16">
      {/* Retro Pull-String Hanging Lamp */}
      <div className="flex flex-col items-center mb-6">
        {/* Lamp Wire */}
        <div className="w-0.5 h-10 bg-gradient-to-b from-gray-500 to-gray-400" />

        {/* Lamp Shade */}
        <div
          className={`w-20 h-10 rounded-t-full transition-all duration-300 relative ${
            isLampOn
              ? 'bg-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.6)]'
              : 'bg-zinc-700'
          }`}
        >
          {/* Bulb Bottom */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-b-full bg-amber-200/90" />
        </div>

        {/* Pull String Cord with Bead */}
        <div
          onClick={handlePullCord}
          className={`cursor-pointer group flex flex-col items-center mt-2 transition-transform ${
            isPulling ? 'translate-y-3' : ''
          }`}
          title="দড়ি টেনে বাতি জ্বালান বা নেভান"
        >
          <div className="w-0.5 h-12 bg-amber-200/60 group-hover:bg-amber-400 transition-colors" />
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-md group-hover:scale-125 transition-transform" />
          <span className="text-[10px] text-gray-400 mt-1 font-semibold group-hover:text-amber-300">
            দড়ি টানুন 💡
          </span>
        </div>
      </div>

      {/* Account Login / Register Card */}
      <div
        className={`p-6 rounded-3xl glass-panel border transition-all duration-500 ${
          isLampOn
            ? 'border-amber-400/40 shadow-2xl shadow-amber-500/10'
            : 'border-white/10'
        }`}
      >
        <div className="text-center mb-5">
          <h3 className="text-base font-black text-white">
            {isLoginView ? 'একাউন্ট লগইন করুন' : 'নতুন একাউন্ট খুলুন'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            টপ-আপ হিস্ট্রি এবং ওয়ালেট পয়েন্ট ব্যবহারের জন্য লগইন করুন
          </p>
        </div>

        <form onSubmit={e => e.preventDefault()} className="space-y-3.5">
          {!isLoginView && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">আপনার নাম</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="আপনার নাম দিন"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300">ইমেইল বা ফোন নম্বর</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="017XXXXXXXX অথবা email@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-300">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-red-500/20 transition-all mt-2"
          >
            {isLoginView ? 'লগইন করুন' : 'নিবন্ধন সম্পন্ন করুন'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isLoginView ? 'নতুন ইউজার? রেজিস্ট্রেশন করুন →' : 'আগে থেকেই একাউন্ট আছে? লগইন করুন →'}
          </button>
        </div>
      </div>
    </div>
  );
}
