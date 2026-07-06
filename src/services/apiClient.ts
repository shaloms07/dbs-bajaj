import { useAuthStore } from '../store/authStore';

const DEFAULT_API_BASE_URL = 'https://api.dbscore.in';
export const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: Response) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null as any);
    }
  });
  failedQueue = [];
};

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export interface ExtendedRequestInit extends RequestInit {
  _isRetry?: boolean;
}

export function getApiErrorMessage(data: unknown, fallback: string): string {
  const d = data as ApiErrorResponse | null;
  return (
    (d && typeof d.detail === 'string' && d.detail) ||
    (d && typeof d.message === 'string' && d.message) ||
    fallback
  );
}

export async function parseJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null);
}

export async function parseApiError(response: Response, fallback: string): Promise<string> {
  const data = await parseJson<ApiErrorResponse>(response);
  return getApiErrorMessage(data, fallback);
}

export function clearSessionOnAuthError(response: Response): void {
  if (response.status === 401) {
    useAuthStore.getState().clearAuth();
  }
}

export async function apiFetch(url: string, init?: ExtendedRequestInit): Promise<Response> {
  const { _isRetry, ...nativeInit } = init || {};

  const options: RequestInit = {
    ...nativeInit,
    credentials: 'include',
  };

  if (options.headers) {
    const headers = new Headers(options.headers);
    headers.delete('Authorization');
    options.headers = headers;
  }

  const response = await fetch(url, options);

  const isLoginOrRefresh = url.includes('/auth/login') || url.includes('/auth/refresh');

  if (response.status === 401 && !isLoginOrRefresh && !_isRetry) {
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: () => {
            apiFetch(url, { ...init, _isRetry: true })
              .then(resolve)
              .catch(reject);
          },
          reject: (err) => {
            reject(err);
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        isRefreshing = false;
        processQueue(null);
        return apiFetch(url, { ...init, _isRetry: true });
      } else {
        isRefreshing = false;
        const error = new Error('Session expired');
        processQueue(error);
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw error;
      }
    } catch (err) {
      isRefreshing = false;
      processQueue(err instanceof Error ? err : new Error(String(err)));
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw err;
    }
  }

  return response;
}
