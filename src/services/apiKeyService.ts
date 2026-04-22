import { useAuthStore } from '../store/authStore';
import { ensureValidAccessToken } from './authService';

const DEFAULT_API_BASE_URL = 'https://driver-behavior-score.onrender.com';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface CreateApiKeyResponse extends ApiKeyItem {
  raw_key: string;
  warning: string;
}

type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

async function withAuthorizedRequest(execute: (token: string) => Promise<Response>) {
  let token = await ensureValidAccessToken();

  let response = await execute(token);

  if (response.status === 401) {
    try {
      token = await ensureValidAccessToken(true);
      response = await execute(token);
    } catch {
      useAuthStore.getState().clearAuth();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  return response;
}

async function parseError(response: Response, fallbackMessage: string) {
  const data = (await response.json().catch(() => null)) as ApiErrorResponse | null;

  return (
    (data && typeof data.detail === 'string' && data.detail) ||
    (data && typeof data.message === 'string' && data.message) ||
    fallbackMessage
  );
}

export async function fetchApiKeys(): Promise<ApiKeyItem[]> {
  const response = await withAuthorizedRequest((token) =>
    fetch(`${apiBaseUrl}/auth/api-keys`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  );

  const data = (await response.json().catch(() => null)) as ApiKeyItem[] | ApiErrorResponse | null;

  if (!response.ok) {
    throw new Error(
      (data && !Array.isArray(data) && ((typeof data.detail === 'string' && data.detail) || (typeof data.message === 'string' && data.message))) ||
        'Unable to fetch API keys'
    );
  }

  if (!Array.isArray(data)) {
    throw new Error('API keys response is invalid');
  }

  return data;
}

export async function createApiKey(name: string): Promise<CreateApiKeyResponse> {
  const response = await withAuthorizedRequest((token) =>
    fetch(`${apiBaseUrl}/auth/api-keys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
  );

  const data = (await response.json().catch(() => null)) as CreateApiKeyResponse | ApiErrorResponse | null;

  if (!response.ok) {
    throw new Error(
      (data && !('raw_key' in data) && ((typeof data.detail === 'string' && data.detail) || (typeof data.message === 'string' && data.message))) ||
        'Unable to create API key'
    );
  }

  if (!data || !('raw_key' in data) || typeof data.raw_key !== 'string') {
    throw new Error('Create API key response is invalid');
  }

  return data;
}

export async function renameApiKey(keyId: string, name: string): Promise<ApiKeyItem> {
  const response = await withAuthorizedRequest((token) =>
    fetch(`${apiBaseUrl}/auth/api-keys/${encodeURIComponent(keyId)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
  );

  const data = (await response.json().catch(() => null)) as ApiKeyItem | ApiErrorResponse | null;

  if (!response.ok) {
    throw new Error(
      (data && !('id' in data) && ((typeof data.detail === 'string' && data.detail) || (typeof data.message === 'string' && data.message))) ||
        'Unable to rename API key'
    );
  }

  if (!data || !('id' in data) || typeof data.id !== 'string') {
    throw new Error('Rename API key response is invalid');
  }

  return data;
}

export async function deleteApiKey(keyId: string): Promise<void> {
  const response = await withAuthorizedRequest((token) =>
    fetch(`${apiBaseUrl}/auth/api-keys/${encodeURIComponent(keyId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  );

  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    throw new Error(await parseError(response, 'Unable to revoke API key'));
  }
}
