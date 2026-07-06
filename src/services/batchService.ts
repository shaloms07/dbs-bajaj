import { useAuthStore } from '../store/authStore';
import { apiFetch } from './apiClient';

const DEFAULT_API_BASE_URL = 'https://api.dbscore.in/';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export interface BatchLookupResult {
  vehicle_number: string;
  category: string;
  category_description: string;
  score: number;
  risk_level: string;
  premium_modifier_pct: number;
  total_violations: number;
}

export interface BatchLookupResponse {
  results: BatchLookupResult[];
  total_results: number;
  risk_category_counts: Record<string, number>;
}

export async function submitBatch(vehicleNumbers: string[]): Promise<BatchLookupResponse> {
  const response = await apiFetch(`${apiBaseUrl}/dashboard/lookup/batch?include_rc=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vehicle_numbers: vehicleNumbers
    })
  });

  const data = (await response.json().catch(() => null)) as
    | BatchLookupResponse
    | { detail?: string; message?: string }
    | null;

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      'Batch lookup failed';
    throw new Error(message);
  }

  if (
    !data ||
    !('results' in data) ||
    !Array.isArray(data.results) ||
    !('total_results' in data) ||
    typeof data.total_results !== 'number' ||
    !('risk_category_counts' in data) ||
    typeof data.risk_category_counts !== 'object'
  ) {
    throw new Error('Batch lookup response is invalid');
  }

  console.log('Batch lookup API response:', data);

  return data;
}
