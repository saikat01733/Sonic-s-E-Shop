'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-xs font-bold text-gray-300 block">{label}</label>}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-gray-400 pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/60 transition-all',
              icon ? 'pl-9 pr-3.5' : 'px-3.5',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] text-red-400 font-semibold">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
