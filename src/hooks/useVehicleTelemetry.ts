import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchVehicleTelemetry, TelemetryFilter, VehicleTelemetryData } from '../services/telemetryService';

const LAST_YEAR_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type VehicleTelemetryQueryOptions = {
  queryKey?: Array<string>;
  queryFn?: () => Promise<VehicleTelemetryData>;
  initialData?: VehicleTelemetryData;
  initialDataUpdatedAt?: number;
  staleTime?: number;
  refetchOnMount?: boolean | 'always';
  refetchOnWindowFocus?: boolean;
};

type StoredTelemetryCache = {
  savedAt: number;
  data: VehicleTelemetryData;
};

function readTelemetryCache(storageKey: string) {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return null;
    const parsedValue = JSON.parse(rawValue) as StoredTelemetryCache;
    if (!parsedValue?.savedAt || !parsedValue?.data) return null;
    return parsedValue;
  } catch {
    return null;
  }
}

function writeTelemetryCache(storageKey: string, data: VehicleTelemetryData) {
  if (typeof window === 'undefined') return;

  try {
    const payload: StoredTelemetryCache = {
      savedAt: Date.now(),
      data
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Ignore cache write failures and keep the live query path working.
  }
}

function useVehicleTelemetryQuery(filter: TelemetryFilter, options?: VehicleTelemetryQueryOptions) {
  return useQuery<VehicleTelemetryData, Error>({
    queryKey:
      options?.queryKey ?? ['vehicle-telemetry', filter.customerId, filter.vehicleNumber, filter.bbid, filter.startDateTime, filter.endDateTime],
    queryFn: options?.queryFn ?? (() => fetchVehicleTelemetry(filter)),
    enabled: Boolean(filter.vehicleNumber && filter.bbid && filter.startDateTime && filter.endDateTime),
    initialData: options?.initialData,
    initialDataUpdatedAt: options?.initialDataUpdatedAt,
    staleTime: options?.staleTime ?? 0,
    refetchOnMount: options?.refetchOnMount ?? 'always',
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true
  });
}

export function useVehicleTelemetry(filter: TelemetryFilter) {
  return useVehicleTelemetryQuery(filter);
}

export function useMonthlyCachedVehicleTelemetry(filter: TelemetryFilter, cacheScope: string) {
  const storageKey = `vehicle-telemetry:${cacheScope}:${filter.customerId}:${filter.vehicleNumber}:${filter.bbid}`;
  const cachedTelemetry = useMemo(() => readTelemetryCache(storageKey), [storageKey]);

  return useVehicleTelemetryQuery(filter, {
    queryKey: ['vehicle-telemetry', cacheScope, filter.customerId, filter.vehicleNumber, filter.bbid],
    queryFn: async () => {
      const freshTelemetry = await fetchVehicleTelemetry(filter);
      writeTelemetryCache(storageKey, freshTelemetry);
      return freshTelemetry;
    },
    initialData: cachedTelemetry?.data,
    initialDataUpdatedAt: cachedTelemetry?.savedAt,
    staleTime: LAST_YEAR_CACHE_TTL_MS,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
}
