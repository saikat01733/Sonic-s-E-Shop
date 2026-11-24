'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User } from 'lucide-react';

export function PullStringLamp() {
  const [isLampOn, setIsLampOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  const handlePullCord = () => {
    setIsPulling(true);
    setTimeout(() => {
      setIsLampOn(!isLampOn);
      setIsPulling(false);
    }, 200);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Hanging Lamp Animation */}
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-10 bg-gradient-to-b from-gray-500 to-gray-400" />
        <div
          className={`w-20 h-10 rounded-t-full transition-all duration-300 relative ${
            isLampOn ? 'bg-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.6)]' : 'bg-zinc-700'
          }`}
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 rounded-b-full bg-cyan-200/90" />
        </div>

        <div
          onClick={handlePullCord}
          className={`cursor-pointer group flex flex-col items-center mt-2 transition-transform select-none ${
            isPulling ? 'translate-y-3' : ''
          }`}
          title="দড়ি টেনে বাতি জ্বালান"
        >
          <div className="w-0.5 h-12 bg-cyan-200/60 group-hover:bg-cyan-400 transition-colors" />
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md group-hover:scale-125 transition-transform" />
          <span className="text-[10px] text-gray-400 mt-1 font-semibold group-hover:text-cyan-300">
            দড়ি টানুন 💡
          </span>
        </div>
      </div>

      {/* Card */}
      <Card
        variant="glass"
        className={`p-6 border transition-all duration-500 ${
          isLampOn ? 'border-cyan-400/40 shadow-2xl shadow-cyan-500/10' : 'border-white/10'
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
            <Input label="আপনার নাম" placeholder="আপনার নাম লিখুন" icon={<User className="w-4 h-4" />} />
          )}
          <Input
            label="ইমেইল বা ফোন নম্বর"
            placeholder="017XXXXXXXX অথবা email@gmail.com"
            icon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="পাসওয়ার্ড"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
          />
          <Button variant="primary" size="md" className="w-full mt-2">
            {isLoginView ? 'লগইন করুন' : 'নিবন্ধন সম্পন্ন করুন'}
          </Button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {isLoginView ? 'নতুন ইউজার? রেজিস্ট্রেশন করুন →' : 'আগে থেকেই একাউন্ট আছে? লগইন করুন →'}
          </button>
        </div>
      </Card>
    </div>
  );
}
