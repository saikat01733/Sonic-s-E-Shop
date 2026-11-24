'use client';

import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/lib/utils';

export function useClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyToClipboard(text);
      if (ok) {
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), timeout);
      }
      return ok;
    },
    [timeout]
  );

  return { copy, hasCopied };
}
