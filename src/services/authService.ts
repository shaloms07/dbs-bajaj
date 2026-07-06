const DEFAULT_API_BASE_URL = 'https://api.dbscore.in/';
const apiBaseUrl = (import.meta.env.VITE_DBS_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export interface AuthUser {
  name: string;
  email?: string;
  insurer?: string;
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

function toAuthSession(
  data: any,
  fallbackUsername?: string
): AuthSession {
  return {
    token: '',
    refreshToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    user: {
      name: (data && typeof data.name === 'string' && data.name) || fallbackUsername || 'User',
      email: (data && typeof data.email === 'string' && data.email) || fallbackUsername
    }
  };
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    const message =
      (data && typeof data.detail === 'string' && data.detail) ||
      (data && typeof data.message === 'string' && data.message) ||
      'Login failed';
    throw new Error(message);
  }

  return toAuthSession(data, payload.username);
}
