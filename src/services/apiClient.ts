import { useAuthStore } from '../store/authStore';

const DEFAULT_API_BASE_URL = 'https://citihubkiosk.com/dbs';
export const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

export async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export function getApiErrorMessage(data: unknown, fallbackMessage: string) {
  if (data && typeof data === 'object') {
    const record = data as ApiErrorResponse;
    if (typeof record.detail === 'string' && record.detail) return record.detail;
    if (typeof record.message === 'string' && record.message) return record.message;
  }

  return fallbackMessage;
}

export async function parseApiError(response: Response, fallbackMessage: string) {
  const data = await parseJson<ApiErrorResponse>(response);
  return getApiErrorMessage(data, fallbackMessage);
}

export function clearSessionOnAuthError(response: Response) {
  if (response.status === 401 || response.status === 403) {
    useAuthStore.getState().clearAuth();
  }
}

export async function fetchWithCookies(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    credentials: 'include'
  });
}
