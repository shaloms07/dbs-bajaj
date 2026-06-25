import { AuthUser, useAuthStore } from '../store/authStore';
import { apiBaseUrl, apiFetch, getApiErrorMessage, parseJson } from './apiClient';


export interface LoginResponse {
  email?: string;
  name?: string;
  username?: string;
  insurer?: string;
  user?: Partial<AuthUser>;
  detail?: string;
  message?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
}

function toAuthUser(data: LoginResponse | null, fallbackUsername: string): AuthUser {
  const responseUser = data?.user && typeof data.user === 'object' ? data.user : {};
  const name = responseUser.name ?? data?.name ?? fallbackUsername;
  const username = responseUser.username ?? data?.username ?? fallbackUsername;
  const email = responseUser.email ?? data?.email;
  const insurer = responseUser.insurer ?? data?.insurer;

  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Login response is missing user details');
  }

  return {
    name,
    username: typeof username === 'string' && username ? username : undefined,
    email: typeof email === 'string' && email ? email : undefined,
    insurer: typeof insurer === 'string' && insurer ? insurer : undefined
  };
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const username = payload.username.trim();

  if (!username || !payload.password) {
    throw new Error('Enter credentials');
  }

  let response: Response;

  try {
    response = await apiFetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password: payload.password })
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unable to reach auth server');
  }

  const data = await parseJson<LoginResponse>(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Login failed'));
  }

  return {
    user: toAuthUser(data, username)
  };
}

export async function logout(): Promise<void> {
  try {
    await apiFetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    useAuthStore.getState().clearAuth();
  }
}
