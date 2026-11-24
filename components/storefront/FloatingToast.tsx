'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  desc: string;
  icon?: string;
}

interface FloatingToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function FloatingToast({ toast, onClose }: FloatingToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm rounded-2xl glass-panel bg-[#0d121d]/95 border border-emerald-500/30 p-3.5 shadow-2xl flex items-start gap-3 animate-bounce-short">
      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 text-base">
        {toast.icon || '✓'}
      </div>
      <div className="flex-1 pr-2">
        <h4 className="text-xs font-black text-white">{toast.title}</h4>
        <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{toast.desc}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-md text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
