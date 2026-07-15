import { useState, useEffect, useRef, useCallback } from 'react';
import { addNoise } from '../utils/helpers';

interface UseLiveDataOptions<T> {
  initialData: T;
  intervalMs: number;
  updater: (current: T) => T;
  enabled?: boolean;
}

export function useLiveData<T>({
  initialData,
  intervalMs,
  updater,
  enabled = true,
}: UseLiveDataOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    setData((current) => updater(current));
    setLastUpdated(new Date());
  }, [updater]);

  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(refresh, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, intervalMs, refresh]);

  return { data, lastUpdated, refresh };
}

// Crowd-specific live data hook
export function useLiveCrowdData(initialData: Array<{ currentOccupancy: number; [key: string]: unknown }>) {
  return useLiveData({
    initialData,
    intervalMs: 30_000,
    updater: (zones) =>
      zones.map((zone) => ({
        ...zone,
        currentOccupancy: Math.max(
          0,
          Math.min(
            (zone as any).capacity,
            Math.round(addNoise(zone.currentOccupancy, 50))
          )
        ),
        lastUpdated: new Date().toISOString(),
      })),
  });
}
