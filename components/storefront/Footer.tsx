'use client';

import React from 'react';
import Link from 'next/link';
import { SiteSettings } from '@/lib/types';
import { ShieldCheck, MessageCircle, Heart, Phone } from 'lucide-react';

interface FooterProps {
  settings?: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-white/10 liquid-glass rounded-t-3xl pt-10 pb-20 sm:pb-8 text-xs text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs">
                ⚡
              </div>
              <span className="font-extrabold text-sm text-white">
                {settings?.siteName || "SONIC'S E-SHOP"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              বাংলাদেশের ১ নম্বর দ্রুততম এবং নির্ভরযোগ্য অনলাইন গেমিং টপ-আপ প্ল্যাটফর্ম। ই-ফুটবল কয়েন, পাবজি ইউসি এবং রোব্লক্স রোবক্স ইনস্ট্যান্ট ডেলিভারি।
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">দ্রুত লিংক</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">হোম পেজ</Link></li>
              <li><Link href="/games" className="hover:text-white transition-colors">সকল গেম ক্যাটালগ</Link></li>
              <li><Link href="/coupons" className="hover:text-white transition-colors">কুপন ও বিশেষ ছাড়</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">অর্ডার ট্র্যাকিং ও রসিদ</Link></li>
              <li><Link href="/wallet" className="hover:text-white transition-colors">ডিজিটাল ওয়ালেট</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Top-Ups */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">জনপ্রিয় টপ-আপ</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/games/efootball-coin" className="hover:text-red-400 transition-colors">eFootball™ Coins Top-Up</Link></li>
              <li><Link href="/games/pubg-mobile-uc" className="hover:text-amber-400 transition-colors">PUBG Mobile UC Top-Up</Link></li>
              <li><Link href="/games/roblox-robux" className="hover:text-cyan-400 transition-colors">Roblox Robux Top-Up</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">কাস্টমার অ্যাকাউন্ট লগইন</Link></li>
            </ul>
          </div>

          {/* Col 4: 24/7 Helpline & Payments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">২৪/৭ কাস্টমার সাপোর্ট</h4>
            <a
              href={settings?.whatsappUrl || "https://wa.me/8801733185830"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: {settings?.supportPhone || "01733185830"}</span>
            </a>
            <div className="pt-2 text-[11px] text-gray-500">
              পেমেন্ট পার্টনার: <strong>bKash</strong> ও <strong>Nagad</strong> পার্সোনাল সেন্ড মানি
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
          <div>
            © 2026 {settings?.siteName || "Sonic's E-Shop"}. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Built with Next.js 16, MongoDB & Firebase by</span>
            <strong className="text-white">md-asif-iqbal</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
