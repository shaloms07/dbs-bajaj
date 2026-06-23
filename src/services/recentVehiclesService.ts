import { ApiErrorResponse, apiBaseUrl, clearSessionOnAuthError, fetchWithCookies, getApiErrorMessage, parseJson } from './apiClient';

export interface RecentVehicleItem {
  vehicle_number: string;
  risk_category: string;
  queried_at: string;
}

function mapRecentVehicleItem(value: unknown): RecentVehicleItem {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    vehicle_number: typeof item.vehicle_number === 'string' ? item.vehicle_number : '',
    risk_category: typeof item.risk_category === 'string' ? item.risk_category : 'UNKNOWN',
    queried_at: typeof item.queried_at === 'string' ? item.queried_at : ''
  };
}

export async function fetchRecentVehicles(): Promise<RecentVehicleItem[]> {
  const response = await fetchWithCookies(`${apiBaseUrl}/dashboard/usage/recent-vehicles`, {
    method: 'GET'
  });
  const data = await parseJson<RecentVehicleItem[] | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, 'Unable to fetch recent vehicles'));
  }

  if (!Array.isArray(data)) {
    throw new Error('Recent vehicles response is invalid');
  }

  return data.map(mapRecentVehicleItem).filter((item) => item.vehicle_number);
}
