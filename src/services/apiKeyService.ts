import {
  ApiErrorResponse,
  apiBaseUrl,
  clearSessionOnAuthError,
  fetchWithCookies,
  getApiErrorMessage,
  parseApiError,
  parseJson
} from './apiClient';

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

function assertKeyId(keyId: string) {
  if (!keyId.trim()) {
    throw new Error('API key id is required');
  }
}

function normalizeKeyName(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('API key name is required');
  }
  return trimmedName;
}

function isApiKeyItem(value: unknown): value is ApiKeyItem {
  const item = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  return Boolean(
    item &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.key_prefix === 'string' &&
      typeof item.is_active === 'boolean' &&
      typeof item.created_at === 'string' &&
      (typeof item.last_used_at === 'string' || item.last_used_at === null)
  );
}

export async function fetchApiKeys(): Promise<ApiKeyItem[]> {
  const response = await fetchWithCookies(`${apiBaseUrl}/auth/api-keys`, {
    method: 'GET'
  });

  const data = await parseJson<ApiKeyItem[] | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, 'Unable to fetch API keys'));
  }

  if (!Array.isArray(data) || !data.every(isApiKeyItem)) {
    throw new Error('API keys response is invalid');
  }

  return data;
}

export async function createApiKey(name: string): Promise<CreateApiKeyResponse> {
  const normalizedName = normalizeKeyName(name);
  const response = await fetchWithCookies(`${apiBaseUrl}/auth/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: normalizedName })
  });

  const data = await parseJson<CreateApiKeyResponse | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, 'Unable to create API key'));
  }

  if (!isApiKeyItem(data) || typeof data.raw_key !== 'string') {
    throw new Error('Create API key response is invalid');
  }

  return data;
}

export async function renameApiKey(keyId: string, name: string): Promise<ApiKeyItem> {
  assertKeyId(keyId);
  const normalizedName = normalizeKeyName(name);

  const response = await fetchWithCookies(`${apiBaseUrl}/auth/api-keys/${encodeURIComponent(keyId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: normalizedName })
  });

  const data = await parseJson<ApiKeyItem | ApiErrorResponse>(response);

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(getApiErrorMessage(data, 'Unable to rename API key'));
  }

  if (!isApiKeyItem(data)) {
    throw new Error('Rename API key response is invalid');
  }

  return data;
}

export async function deleteApiKey(keyId: string): Promise<void> {
  assertKeyId(keyId);

  const response = await fetchWithCookies(`${apiBaseUrl}/auth/api-keys/${encodeURIComponent(keyId)}`, {
    method: 'DELETE'
  });

  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    clearSessionOnAuthError(response);
    throw new Error(await parseApiError(response, 'Unable to revoke API key'));
  }
}
