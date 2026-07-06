import { useAuthStore } from '../store/authStore';

const DEFAULT_API_BASE_URL = 'https://api.dbscore.in';
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

let activeRefreshPromise: Promise<boolean> | null = null;

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const urlString = typeof input === 'string' ? input : (input as Request).url || input.toString();
  const isAuthRoute =
    urlString.includes('/auth/login') ||
    urlString.includes('/auth/register') ||
    urlString.includes('/auth/refresh') ||
    urlString.includes('/auth/logout');

  if (isAuthRoute) {
    return fetch(input, {
      ...init,
      credentials: 'include'
    });
  }

  const response = await fetch(input, {
    ...init,
    credentials: 'include'
  });

  if (response.status === 401) {
    if (!activeRefreshPromise) {
      activeRefreshPromise = (async () => {
        try {
          const refreshRes = await fetch(`${apiBaseUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          });
          return refreshRes.ok;
        } catch (err) {
          console.error("Refresh token error:", err);
          return false;
        } finally {
          activeRefreshPromise = null;
        }
      })();
    }

    const refreshSuccess = await activeRefreshPromise;

    if (refreshSuccess) {
      return fetch(input, {
        ...init,
        credentials: 'include'
      });
    } else {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  return response;
}
