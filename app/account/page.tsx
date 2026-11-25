'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      if (isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/orders');
      }
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white text-xs">
      <div className="animate-pulse">Loading Profile...</div>
    </div>
  );
}
