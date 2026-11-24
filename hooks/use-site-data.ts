'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameItem, SiteSettings, CouponItem, TrustBadge } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

interface SiteDataState {
  settings: SiteSettings;
  trustBadges: TrustBadge[];
  games: GameItem[];
  coupons: CouponItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSiteData(initialData?: {
  settings?: SiteSettings;
  trustBadges?: TrustBadge[];
  games?: GameItem[];
  coupons?: CouponItem[];
}): SiteDataState {
  const [settings, setSettings] = useState<SiteSettings>(initialData?.settings || DEFAULT_SETTINGS);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>(initialData?.trustBadges || []);
  const [games, setGames] = useState<GameItem[]>(initialData?.games || []);
  const [coupons, setCoupons] = useState<CouponItem[]>(initialData?.coupons || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteData = useCallback(async () => {
    try {
      if (!initialData) setLoading(true);
      setError(null);
      const res = await fetch('/api/site-data');
      const json = await res.json();
      if (json.success) {
        setSettings(json.data.settings || DEFAULT_SETTINGS);
        setTrustBadges(json.data.trustBadges || []);
        setGames(json.data.games || []);
        setCoupons(json.data.coupons || []);
      } else {
        setError(json.error || 'Failed to load site data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

  return {
    settings,
    trustBadges,
    games,
    coupons,
    loading,
    error,
    refresh: fetchSiteData,
  };
}
