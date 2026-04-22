import { useAuthStore } from '../store/authStore';
import { ensureValidAccessToken } from './authService';
import { ScoreBand, ScoreResult, Violation } from '../types/score';
import { bandFromScore } from '../utils/bandFromScore';

const DEFAULT_API_BASE_URL = 'https://driver-behavior-score.onrender.com';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

interface LookupViolationResponse {
  challan_details?: string;
  offense_details: string;
  challan_date: string;
  challan_place?: string;
  fine_amount: number;
  paid_status: boolean;
  severity: string;
  thz_category?: {
    name?: string;
    description?: string;
    deduction?: number;
  };
}

interface LookupResponse {
  violations: LookupViolationResponse[];
  dbs: {
    dbs_stats: {
      vehicle_number: string;
      score: number;
      total_deductions: number;
      risk_level: string;
      premium_modifier_pct: number;
      total_violations: number;
      severe_violations: number;
      moderate_violations: number;
      low_violations: number;
    };
    base_premium: number;
    adjusted_premium: number;
  };
  vehicle: {
    vehicle_number: string;
    category: string;
    category_description: string;
    state_code: string;
    state_name: string;
    fuel_type: string;
    cc: number;
    owner_name?: string;
  };
  fresh_as_of: string;
  queried_at: string;
}

function mapSeverityToThz(severity: string): Violation['thz'] {
  const normalized = severity.trim().toLowerCase();
  if (normalized.includes('severe') || normalized.includes('high')) return 'H';
  if (normalized.includes('moderate') || normalized.includes('medium')) return 'M';
  return 'L';
}

function mapRiskLevelToBand(riskLevel: string, score: number): ScoreBand {
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

  return allowed.includes(normalized as ScoreBand) ? (normalized as ScoreBand) : bandFromScore(score);
}

function mapViolationStatus(paidStatus: boolean): Violation['status'] {
  return paidStatus ? 'Paid' : 'Open';
}

function buildVehicleType(vehicle: LookupResponse['vehicle']): string {
  const primary = vehicle.category_description || vehicle.category || 'Unknown Vehicle';
  const extras = [vehicle.fuel_type, vehicle.cc ? `${vehicle.cc}cc` : ''].filter(Boolean).join(' · ');
  return extras ? `${primary} · ${extras}` : primary;
}

export async function fetchScore(regNo: string): Promise<ScoreResult> {
  const norm = regNo.toUpperCase().replace(/\s+/g, '');
  let token = await ensureValidAccessToken();

  const requestLookup = async (accessToken: string) =>
    fetch(`${apiBaseUrl}/dashboard/lookup/${encodeURIComponent(norm)}`, {
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
    } catch {
      useAuthStore.getState().clearAuth();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const data = (await response.json().catch(() => null)) as LookupResponse | { detail?: string; message?: string } | null;

  if (!response.ok) {
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      (response.status === 404 ? 'Vehicle not found' : 'Unable to fetch vehicle lookup');
    throw new Error(message);
  }

  if (!data || !('dbs' in data) || !('vehicle' in data)) {
    throw new Error('Vehicle lookup response is invalid');
  }

  console.log('Vehicle lookup API response:', data);

  const score = data.dbs.dbs_stats.score ?? 0;
  const band = mapRiskLevelToBand(data.dbs.dbs_stats.risk_level ?? '', score);
  const basePremium = data.dbs.base_premium ?? 0;
  const adjustedPremium = data.dbs.adjusted_premium ?? 0;
  const tpLoading = Math.round(adjustedPremium - basePremium);
  const violations = (data.violations ?? []).map((violation) => ({
    type: violation.offense_details || 'Traffic violation',
    date: violation.challan_date,
    location: violation.challan_place || data.vehicle.state_name || data.vehicle.state_code || 'Unknown',
    thz: mapSeverityToThz(violation.severity || ''),
    status: mapViolationStatus(Boolean(violation.paid_status)),
    impact: violation.fine_amount ?? 0,
    challanDetails: violation.challan_details || violation.offense_details || 'N/A',
    categoryCode: violation.thz_category?.name,
    categoryName: violation.thz_category?.name,
    categoryDescription: violation.thz_category?.description,
    categoryDeduction: violation.thz_category?.deduction
  }));

  return {
    regNo: data.vehicle.vehicle_number || data.dbs.dbs_stats.vehicle_number || norm,
    vehicleType: buildVehicleType(data.vehicle),
    ownerName: data.vehicle.owner_name,
    score,
    band,
    severityIndex: data.dbs.dbs_stats.total_deductions ?? 0,
    recentTrend: 'Stable',
    challanStatus: violations.some((violation) => violation.status === 'Open') ? 'Pending' : 'Clear',
    tpLoading,
    violations,
    basePremium,
    adjustedPremium,
    fuelType: data.vehicle.fuel_type,
    stateName: data.vehicle.state_name,
    cc: data.vehicle.cc,
    queriedAt: data.queried_at,
    freshAsOf: data.fresh_as_of
  };
}
