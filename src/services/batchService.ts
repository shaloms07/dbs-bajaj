import { ApiErrorResponse, apiBaseUrl, apiFetch, clearSessionOnAuthError, getApiErrorMessage, parseJson } from './apiClient';

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

function normalizeVehicleNumbers(vehicleNumbers: string[]) {
  const normalized = [...new Set(vehicleNumbers.map((vehicleNumber) => vehicleNumber.trim().toUpperCase()).filter(Boolean))];

  if (normalized.length === 0) {
    throw new Error('At least one vehicle number is required');
  }

  return normalized;
}

function isBatchLookupResponse(value: unknown): value is BatchLookupResponse {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  return Boolean(
    item &&
      Array.isArray(item.results) &&
      typeof item.total_results === 'number' &&
      item.risk_category_counts &&
      typeof item.risk_category_counts === 'object'
  );
}

export async function submitBatch(vehicleNumbers: string[]): Promise<BatchLookupResponse> {
  const normalizedVehicleNumbers = normalizeVehicleNumbers(vehicleNumbers);
  const response = await apiFetch(`${apiBaseUrl}/dashboard/lookup/batch?include_rc=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vehicle_numbers: normalizedVehicleNumbers
    })
  });

  const data = await parseJson<BatchLookupResponse | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, 'Batch lookup failed'));
  }

  if (!isBatchLookupResponse(data)) {
    throw new Error('Batch lookup response is invalid');
  }

  return data;
}
