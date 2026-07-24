import { ApiErrorResponse, apiBaseUrl, apiFetch, clearSessionOnAuthError, getApiErrorMessage, parseJson } from './apiClient';

export interface TelematicsDevice {
  imei: string;
  vehicle_reg_no: string;
  last_seen_at: string | null;
}

export interface TelematicsDeviceListResponse {
  items: TelematicsDevice[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Trip {
  id: string;
  started_at: string | null;
  ended_at: string | null;
  total_distance_km: number | null;
  total_duration_seconds: number | null;
  start_lat: number | null;
  start_lon: number | null;
  end_lat: number | null;
  end_lon: number | null;
  max_speed_kmph: number | null;
  avg_speed_kmph: number | null;
}

export interface VehicleTripsResponse {
  active_trip: Trip | null;
  recent_trips: Trip[];
}

export interface DistanceStats {
  total_km: number;
  avg_per_trip_km: number;
  longest_trip_km: number;
  shortest_trip_km: number;
  day_km: number;
  night_km: number;
  night_pct: number;
}

export interface DurationStats {
  total_seconds: number;
  avg_per_trip_seconds: number;
  longest_trip_seconds: number;
  day_seconds: number;
  night_seconds: number;
}

export interface SpeedStats {
  max_kmph: number;
  avg_kmph: number;
}

export interface SafetyStats {
  harsh_acceleration: number;
  harsh_braking: number;
  harsh_turning: number;
  overspeeding_count: number;
  total_harsh_events: number;
  harsh_events_per_100km: number;
}

export interface VehicleStatsResponse {
  vehicle_reg_no: string;
  range: string | null;
  from: string; // Serialized key for from_date
  to: string;   // Serialized key for to_date
  trips_included: number;
  distance: DistanceStats;
  duration: DurationStats;
  speed: SpeedStats;
  safety: SafetyStats;
}

// Helper to sanitize/convert numbers safely
function toNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function mapTrip(t: any): Trip {
  return {
    id: typeof t.id === 'string' ? t.id : '',
    started_at: typeof t.started_at === 'string' ? t.started_at : null,
    ended_at: typeof t.ended_at === 'string' ? t.ended_at : null,
    total_distance_km: t.total_distance_km != null ? toNumber(t.total_distance_km) : null,
    total_duration_seconds: t.total_duration_seconds != null ? Math.round(toNumber(t.total_duration_seconds)) : null,
    start_lat: t.start_lat != null ? toNumber(t.start_lat) : null,
    start_lon: t.start_lon != null ? toNumber(t.start_lon) : null,
    end_lat: t.end_lat != null ? toNumber(t.end_lat) : null,
    end_lon: t.end_lon != null ? toNumber(t.end_lon) : null,
    max_speed_kmph: t.max_speed_kmph != null ? toNumber(t.max_speed_kmph) : null,
    avg_speed_kmph: t.avg_speed_kmph != null ? toNumber(t.avg_speed_kmph) : null,
  };
}

export async function fetchTelematicsVehicles(page = 1, limit = 100): Promise<TelematicsDevice[]> {
  const response = await apiFetch(`${apiBaseUrl}/telematics/vehicles?page=${page}&limit=${limit}`, {
    method: 'GET'
  });
  const data = await parseJson<TelematicsDeviceListResponse | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, 'Unable to fetch telematics vehicles'));
  }

  const items = (data as TelematicsDeviceListResponse)?.items || [];
  return items.map((item: any) => ({
    imei: typeof item.imei === 'string' ? item.imei : '',
    vehicle_reg_no: typeof item.vehicle_reg_no === 'string' ? item.vehicle_reg_no : '',
    last_seen_at: typeof item.last_seen_at === 'string' ? item.last_seen_at : null
  }));
}

export async function fetchVehicleTrips(vehicleRegNo: string): Promise<VehicleTripsResponse> {
  const response = await apiFetch(`${apiBaseUrl}/telematics/vehicles/${encodeURIComponent(vehicleRegNo)}/trips`, {
    method: 'GET'
  });
  const data = await parseJson<VehicleTripsResponse | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, `Unable to fetch trips for vehicle ${vehicleRegNo}`));
  }

  const payload = data as VehicleTripsResponse;
  return {
    active_trip: payload.active_trip ? mapTrip(payload.active_trip) : null,
    recent_trips: Array.isArray(payload.recent_trips) ? payload.recent_trips.map(mapTrip) : []
  };
}

export async function fetchVehicleStats(
  vehicleRegNo: string,
  range?: string,
  fromDate?: string,
  toDate?: string
): Promise<VehicleStatsResponse> {
  let url = `${apiBaseUrl}/telematics/vehicles/${encodeURIComponent(vehicleRegNo)}/stats`;
  const params: string[] = [];
  if (range) {
    params.push(`range=${encodeURIComponent(range)}`);
  } else if (fromDate && toDate) {
    params.push(`from=${encodeURIComponent(fromDate)}`);
    params.push(`to=${encodeURIComponent(toDate)}`);
  }
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  const response = await apiFetch(url, { method: 'GET' });
  const data = await parseJson<VehicleStatsResponse | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, `Unable to fetch stats for vehicle ${vehicleRegNo}`));
  }

  const s = data as any;
  return {
    vehicle_reg_no: typeof s.vehicle_reg_no === 'string' ? s.vehicle_reg_no : '',
    range: typeof s.range === 'string' ? s.range : null,
    from: typeof s.from === 'string' ? s.from : '',
    to: typeof s.to === 'string' ? s.to : '',
    trips_included: toNumber(s.trips_included),
    distance: {
      total_km: toNumber(s.distance?.total_km),
      avg_per_trip_km: toNumber(s.distance?.avg_per_trip_km),
      longest_trip_km: toNumber(s.distance?.longest_trip_km),
      shortest_trip_km: toNumber(s.distance?.shortest_trip_km),
      day_km: toNumber(s.distance?.day_km),
      night_km: toNumber(s.distance?.night_km),
      night_pct: toNumber(s.distance?.night_pct),
    },
    duration: {
      total_seconds: Math.round(toNumber(s.duration?.total_seconds)),
      avg_per_trip_seconds: Math.round(toNumber(s.duration?.avg_per_trip_seconds)),
      longest_trip_seconds: Math.round(toNumber(s.duration?.longest_trip_seconds)),
      day_seconds: Math.round(toNumber(s.duration?.day_seconds)),
      night_seconds: Math.round(toNumber(s.duration?.night_seconds)),
    },
    speed: {
      max_kmph: toNumber(s.speed?.max_kmph),
      avg_kmph: toNumber(s.speed?.avg_kmph),
    },
    safety: {
      harsh_acceleration: Math.round(toNumber(s.safety?.harsh_acceleration)),
      harsh_braking: Math.round(toNumber(s.safety?.harsh_braking)),
      harsh_turning: Math.round(toNumber(s.safety?.harsh_turning)),
      overspeeding_count: Math.round(toNumber(s.safety?.overspeeding_count)),
      total_harsh_events: Math.round(toNumber(s.safety?.total_harsh_events)),
      harsh_events_per_100km: toNumber(s.safety?.harsh_events_per_100km),
    }
  };
}
