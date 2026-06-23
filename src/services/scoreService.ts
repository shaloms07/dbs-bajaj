import { ScoreBand, ScoreResult, Violation } from '../types/score';
import { ApiErrorResponse, apiBaseUrl, clearSessionOnAuthError, fetchWithCookies, getApiErrorMessage, parseJson } from './apiClient';

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

function pickStats(data: LookupResponse): LookupStatsResponse {
  return data.dbs?.dbs_stats ?? data.dbs_stats ?? data.dbs ?? {};
}

export async function fetchScore(regNo: string, includeRc = false): Promise<ScoreResult> {
  const norm = regNo.toUpperCase().replace(/\s+/g, '');

  if (!norm) {
    throw new Error('Vehicle number is required');
  }

  const response = await fetchWithCookies(
    `${apiBaseUrl}/dashboard/lookup/${encodeURIComponent(norm)}?include_rc=${includeRc ? 'true' : 'false'}`,
    {
      method: 'GET'
    }
  );

  const data = await parseJson<LookupResponse | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, response.status === 404 ? 'Vehicle not found' : 'Unable to fetch vehicle lookup'));
  }

  if (!data) {
    throw new Error('Vehicle lookup response is invalid');
  }

  const lookup = data as LookupResponse;
  const stats = pickStats(lookup);
  const vehicle = lookup.vehicle ?? null;
  const score = toNumber(stats.score ?? lookup.score);
  const band = (stats.risk_level ?? lookup.risk_level ?? 'AVERAGE') as ScoreBand;
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
