'use client';

import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  desc: string;
  icon?: string;
}

export function useToast(autoDismissMs = 3500) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((title: string, desc: string, icon = '✓') => {
    setToast({
      id: String(Date.now()),
      title,
      desc,
      icon,
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    dismissToast,
  };
}
