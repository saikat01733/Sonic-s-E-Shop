'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={cn(
          'relative w-full max-w-lg rounded-3xl bg-[#0b1222]/95 [html.light-theme_&]:bg-white border border-white/20 [html.light-theme_&]:border-slate-200 p-4 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.85)] [html.light-theme_&]:shadow-2xl text-white [html.light-theme_&]:text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 [html.light-theme_&]:bg-slate-100 hover:bg-white/20 [html.light-theme_&]:hover:bg-slate-200 text-gray-300 [html.light-theme_&]:text-slate-600 hover:text-white [html.light-theme_&]:hover:text-black transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {title && <h3 className="text-base font-black text-white [html.light-theme_&]:text-slate-900 pr-8">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
}
