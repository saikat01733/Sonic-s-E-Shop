'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-md p-8 text-center space-y-5 border-white/20">
        <div className="w-14 h-14 rounded-3xl bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto shadow-xl">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white">Something went wrong</h2>
          <p className="text-xs text-gray-300 mt-2 leading-relaxed">
            We encountered an unexpected error while processing your request. Please try reloading.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="glass"
            size="md"
            onClick={() => reset()}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
