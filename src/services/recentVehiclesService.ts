import { useAuthStore } from '../store/authStore';
import { apiFetch } from './apiClient';

const DEFAULT_API_BASE_URL = 'https://api.dbscore.in/';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export interface RecentVehicleItem {
  vehicle_number: string;
  risk_category: string;
  queried_at: string;
}

type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

function mapRecentVehicleItem(value: unknown): RecentVehicleItem {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    vehicle_number: typeof item.vehicle_number === 'string' ? item.vehicle_number : '',
    risk_category: typeof item.risk_category === 'string' ? item.risk_category : 'UNKNOWN',
    queried_at: typeof item.queried_at === 'string' ? item.queried_at : ''
  };
}

export async function fetchRecentVehicles(): Promise<RecentVehicleItem[]> {
  const response = await apiFetch(`${apiBaseUrl}/dashboard/usage/recent-vehicles`, {
    method: 'GET'
  });

  const data = (await response.json().catch(() => null)) as RecentVehicleItem[] | ApiErrorResponse | null;

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      'Unable to fetch recent vehicles';
    throw new Error(message);
  }

  if (!Array.isArray(data)) {
    throw new Error('Recent vehicles response is invalid');
  }

  return data.map(mapRecentVehicleItem).filter((item) => item.vehicle_number);
}
