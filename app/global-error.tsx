'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#030712] text-white min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/[0.06] border border-white/15 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center mx-auto text-xl font-black shadow-lg shadow-rose-900/50">
            ⚡
          </div>
          <h2 className="text-lg font-black">Sonic&apos;s E-Shop Error</h2>
          <p className="text-xs text-gray-400">
            A critical system error occurred. Please refresh the page to restore services.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
