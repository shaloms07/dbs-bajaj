import { useAuthStore } from '../store/authStore';
import { ensureValidAccessToken, isSessionExpiredError } from './authService';
import { ScoreBand, ScoreResult, Violation } from '../types/score';

const DEFAULT_API_BASE_URL = 'https://driver-behavior-score.onrender.com';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

interface LookupViolationResponse {
  challan_details?: string;
  offense_details?: string;
  challan_date?: string;
  challan_place?: string;
  fine_amount?: number;
  paid_status?: boolean;
  severity?: string;
  thz_category?: {
    name?: string;
    description?: string;
    deduction?: number;
  };
}

interface LookupStatsResponse {
  score?: number;
  total_deductions?: number;
  risk_level?: string;
  premium_modifier_pct?: number;
  vehicle_number?: string;
  window_start?: string;
  window_end?: string;
  last_violation_datetime?: string | null;
  violation_counts?: {
    total?: number;
    severe?: number;
    moderate?: number;
    low?: number;
  };
}

interface LookupResponse {
  violations?: LookupViolationResponse[];
  dbs?: {
    dbs_stats?: LookupStatsResponse;
    score?: number;
    total_deductions?: number;
    risk_level?: string;
    premium_modifier_pct?: number;
    vehicle_number?: string;
    base_premium?: number;
    adjusted_premium?: number;
    window_start?: string;
    window_end?: string;
    last_violation_datetime?: string | null;
    violation_counts?: {
      total?: number;
      severe?: number;
      moderate?: number;
      low?: number;
    };
  };
  dbs_stats?: LookupStatsResponse;
  vehicle?: {
    vehicle_number?: string;
    category?: string;
    category_description?: string;
    state_code?: string;
    state_name?: string;
    fuel_type?: string;
    cc?: number;
    owner_name?: string;
  } | null;
  vehicle_number?: string;
  score?: number;
  risk_level?: string;
  total_deductions?: number;
  premium_modifier_pct?: number;
  base_premium?: number;
  adjusted_premium?: number;
  window_start?: string;
  window_end?: string;
  last_violation_datetime?: string | null;
  violation_counts?: {
    total?: number;
    severe?: number;
    moderate?: number;
    low?: number;
  };
  fresh_as_of?: string;
  queried_at?: string;
}

function mapSeverityToThz(severity: string): Violation['thz'] {
  const normalized = severity.trim().toLowerCase();
  if (normalized.includes('severe') || normalized.includes('high')) return 'H';
  if (normalized.includes('moderate') || normalized.includes('medium')) return 'M';
  return 'L';
}

function mapRiskLevelToBand(riskLevel: string): ScoreBand {
  const normalized = riskLevel.trim().toUpperCase().replace(/[^A-Z]+/g, '_').replace(/^_+|_+$/g, '');
  const allowed: ScoreBand[] = [
    'EXEMPLARY',
    'RESPONSIBLE',
    'AVERAGE',
    'MARGINAL',
    'AT_RISK',
    'HIGH_RISK',
    'SERIOUS_RISK',
    'CHRONIC_VIOLATOR',
    'HABITUAL_OFFENDER',
    'EXTREME_RISK'
  ];

  return allowed.includes(normalized as ScoreBand) ? (normalized as ScoreBand) : 'AVERAGE';
}

function mapViolationStatus(paidStatus: boolean): Violation['status'] {
  return paidStatus ? 'Paid' : 'Open';
}

function buildVehicleType(vehicle?: LookupResponse['vehicle']): string {
  if (!vehicle) return 'Unknown Vehicle';
  const primary = vehicle.category_description || vehicle.category || 'Unknown Vehicle';
  const extras = [vehicle.fuel_type, vehicle.cc ? `${vehicle.cc}cc` : ''].filter(Boolean).join(' · ');
  return extras ? `${primary} · ${extras}` : primary;
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function pickStats(data: LookupResponse): LookupStatsResponse {
  return data.dbs?.dbs_stats ?? data.dbs_stats ?? data.dbs ?? {};
}

export async function fetchScore(regNo: string, includeRc = false): Promise<ScoreResult> {
  const norm = regNo.toUpperCase().replace(/\s+/g, '');
  let token = await ensureValidAccessToken();

  const requestLookup = async (accessToken: string) =>
    fetch(`${apiBaseUrl}/dashboard/lookup/${encodeURIComponent(norm)}?include_rc=${includeRc ? 'true' : 'false'}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

  let response = await requestLookup(token);

  if (response.status === 401) {
    try {
      token = await ensureValidAccessToken(true);
      response = await requestLookup(token);
    } catch (error) {
      if (isSessionExpiredError(error)) {
        throw new Error('Session expired. Please sign in again.');
      }
      throw error instanceof Error ? error : new Error('Unable to refresh session');
    }
  }

  const data = (await response.json().catch(() => null)) as LookupResponse | { detail?: string; message?: string } | null;

  console.log('[Vehicle Lookup API]', {
    regNo: norm,
    includeRc,
    status: response.status,
    response: data
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      (response.status === 404 ? 'Vehicle not found' : 'Unable to fetch vehicle lookup');
    throw new Error(message);
  }

  if (!data) {
    throw new Error('Vehicle lookup response is invalid');
  }

  const lookup = data as LookupResponse;
  const stats = pickStats(lookup);
  const vehicle = lookup.vehicle ?? null;
  const score = toNumber(stats.score ?? lookup.score);
  const band = mapRiskLevelToBand(toString(stats.risk_level ?? lookup.risk_level));
  const basePremium = toNumber(lookup.dbs?.base_premium ?? lookup.base_premium);
  const adjustedPremium = toNumber(lookup.dbs?.adjusted_premium ?? lookup.adjusted_premium);
  const premiumModifierPct = toNumber(stats.premium_modifier_pct ?? lookup.dbs?.premium_modifier_pct ?? lookup.premium_modifier_pct);
  const tpLoading = Math.round(adjustedPremium - basePremium);
  const violations = (lookup.violations ?? []).map((violation: LookupViolationResponse) => ({
    type: violation.offense_details || 'Traffic violation',
    date: violation.challan_date || '',
    location: violation.challan_place || vehicle?.state_name || vehicle?.state_code || 'Unknown',
    thz: mapSeverityToThz(violation.severity || ''),
    status: mapViolationStatus(Boolean(violation.paid_status)),
    impact: toNumber(violation.thz_category?.deduction ?? 0),
    challanDetails: violation.challan_details || violation.offense_details || 'N/A',
    categoryCode: violation.thz_category?.name,
    categoryName: violation.thz_category?.name,
    categoryDescription: violation.thz_category?.description,
    categoryDeduction: violation.thz_category?.deduction
  }));

  const violationCounts = stats.violation_counts ?? lookup.violation_counts ?? {
    total: violations.length,
    severe: violations.filter((violation) => violation.thz === 'H').length,
    moderate: violations.filter((violation) => violation.thz === 'M').length,
    low: violations.filter((violation) => violation.thz === 'L').length
  };

  return {
    regNo: vehicle?.vehicle_number || stats.vehicle_number || lookup.vehicle_number || norm,
    vehicleType: buildVehicleType(vehicle || undefined),
    ownerName: vehicle?.owner_name,
    score,
    band,
    severityIndex: toNumber(stats.total_deductions ?? lookup.total_deductions),
    recentTrend: 'Stable',
    challanStatus: violations.some((violation) => violation.status === 'Open') ? 'Pending' : 'Clear',
    tpLoading,
    violations,
    basePremium,
    adjustedPremium,
    premiumModifierPct,
    windowStart: stats.window_start ?? lookup.window_start,
    windowEnd: stats.window_end ?? lookup.window_end,
    lastViolationDatetime: stats.last_violation_datetime ?? lookup.last_violation_datetime ?? null,
    violationCounts,
    fuelType: vehicle?.fuel_type,
    stateName: vehicle?.state_name,
    cc: vehicle?.cc,
    queriedAt: lookup.queried_at,
    freshAsOf: lookup.fresh_as_of
  };
}
