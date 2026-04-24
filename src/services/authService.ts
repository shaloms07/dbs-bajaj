import { AuthUser, useAuthStore } from '../store/authStore';

const DEFAULT_API_BASE_URL = 'https://driver-behavior-score.onrender.com';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export interface LoginResponse {
  email: string;
  name: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_expires_in: number;
  refresh_expires_in: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
  user: AuthUser;
}

type AuthErrorCode = 'auth_required' | 'session_expired' | 'refresh_failed' | 'network_error' | 'invalid_response';

class AuthError extends Error {
  status?: number;
  code: AuthErrorCode;

  constructor(message: string, code: AuthErrorCode, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

let refreshInFlight: Promise<AuthSession> | null = null;

function toExpiryTimestamp(expiresInSeconds?: number): number | null {
  return typeof expiresInSeconds === 'number' && expiresInSeconds > 0 ? Date.now() + expiresInSeconds * 1000 : null;
}

function toAuthSession(
  data: Partial<LoginResponse> | { detail?: string; message?: string } | null,
  fallbackUsername?: string
): AuthSession {
  if (!data || !('access_token' in data) || typeof data.access_token !== 'string') {
    throw new AuthError('Login response is missing access token', 'invalid_response');
  }

  return {
    token: data.access_token,
    refreshToken: 'refresh_token' in data && typeof data.refresh_token === 'string' ? data.refresh_token : null,
    accessTokenExpiresAt: 'access_expires_in' in data ? toExpiryTimestamp(data.access_expires_in) : null,
    refreshTokenExpiresAt: 'refresh_expires_in' in data ? toExpiryTimestamp(data.refresh_expires_in) : null,
    user: {
      name: 'name' in data && typeof data.name === 'string' ? data.name : fallbackUsername || 'User',
      email: 'email' in data && typeof data.email === 'string' ? data.email : fallbackUsername
    }
  };
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => null)) as Partial<LoginResponse> | { detail?: string; message?: string } | null;

  if (!response.ok) {
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      'Login failed';
    throw new Error(message);
  }

  return toAuthSession(data, payload.username);
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthSession> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  } catch (error) {
    throw new AuthError(
      error instanceof Error ? error.message : 'Unable to reach auth server for token refresh',
      'network_error'
    );
  }

  const data = (await response.json().catch(() => null)) as Partial<LoginResponse> | { detail?: string; message?: string } | null;

  if (!response.ok) {
    const message =
      (data && 'detail' in data && typeof data.detail === 'string' && data.detail) ||
      (data && 'message' in data && typeof data.message === 'string' && data.message) ||
      'Token refresh failed';
    throw new AuthError(message, response.status === 401 || response.status === 403 ? 'session_expired' : 'refresh_failed', response.status);
  }

  return toAuthSession(data);
}

export function isSessionExpiredError(error: unknown): boolean {
  return error instanceof AuthError && error.code === 'session_expired';
}

function persistRefreshedSession(session: AuthSession) {
  const authState = useAuthStore.getState();
  useAuthStore.getState().setAuth(
    session.token,
    authState.user
      ? {
          ...authState.user,
          ...session.user
        }
      : session.user,
    session.refreshToken ?? authState.refreshToken,
    session.accessTokenExpiresAt,
    session.refreshTokenExpiresAt
  );
}

export async function ensureValidAccessToken(forceRefresh = false): Promise<string> {
  const authState = useAuthStore.getState();

  if (!authState.token) {
    throw new AuthError('Missing auth token', 'auth_required');
  }

  const hasRefreshToken = Boolean(authState.refreshToken);
  const refreshTokenExpired =
    typeof authState.refreshTokenExpiresAt === 'number' && authState.refreshTokenExpiresAt <= Date.now();

  if (refreshTokenExpired) {
    useAuthStore.getState().clearAuth();
    throw new AuthError('Session expired. Please sign in again.', 'session_expired');
  }

  const shouldRefresh =
    forceRefresh ||
    (hasRefreshToken &&
      typeof authState.accessTokenExpiresAt === 'number' &&
      authState.accessTokenExpiresAt - Date.now() <= ACCESS_TOKEN_REFRESH_BUFFER_MS);

  if (!shouldRefresh) {
    return authState.token;
  }

  if (!authState.refreshToken) {
    return authState.token;
  }

  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken(authState.refreshToken)
      .then((session) => {
        console.info('[auth] Access token refreshed successfully');
        persistRefreshedSession(session);
        return session;
      })
      .catch((error) => {
        if (isSessionExpiredError(error)) {
          console.warn('[auth] Refresh token expired or rejected; clearing local auth state');
          useAuthStore.getState().clearAuth();
        } else {
          console.warn('[auth] Token refresh failed without invalidating local session', error);
        }
        throw error;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  const refreshed = await refreshInFlight;
  return refreshed.token;
}
