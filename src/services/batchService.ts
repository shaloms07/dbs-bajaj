import { useAuthStore } from '../store/authStore';
import { ensureValidAccessToken, isSessionExpiredError } from './authService';

const DEFAULT_API_BASE_URL = 'https://driver-behavior-score.onrender.com';
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

async function requestBatchLookup(accessToken: string, vehicleNumbers: string[]) {
  return fetch(`${apiBaseUrl}/dashboard/lookup/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      vehicle_numbers: vehicleNumbers
    })
  });
}

export async function submitBatch(vehicleNumbers: string[]): Promise<BatchLookupResponse> {
  let token = await ensureValidAccessToken();

  let response = await requestBatchLookup(token, vehicleNumbers);

  if (response.status === 401) {
    try {
      token = await ensureValidAccessToken(true);
      response = await requestBatchLookup(token, vehicleNumbers);
    } catch (error) {
      if (isSessionExpiredError(error)) {
        throw new Error('Session expired. Please sign in again.');
      }
      throw error instanceof Error ? error : new Error('Unable to refresh session');
    }
  }

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
