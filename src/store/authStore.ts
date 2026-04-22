import { create } from 'zustand';

export interface AuthUser {
  name: string;
  email?: string;
  insurer?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (
    token: string,
    user: AuthUser,
    refreshToken?: string | null,
    accessTokenExpiresAt?: number | null,
    refreshTokenExpiresAt?: number | null
  ) => void;
  updateTokens: (
    token: string,
    refreshToken?: string | null,
    accessTokenExpiresAt?: number | null,
    refreshTokenExpiresAt?: number | null
  ) => void;
  clearAuth: () => void;
}

const STORAGE_PREFIX = 'dbs_bajaj_';
const LEGACY_STORAGE_PREFIX = 'dbs_';

function storageKey(name: string) {
  return `${STORAGE_PREFIX}${name}`;
}

function legacyStorageKey(name: string) {
  return `${LEGACY_STORAGE_PREFIX}${name}`;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, user, refreshToken = null, accessTokenExpiresAt = null, refreshTokenExpiresAt = null) => {
    localStorage.setItem(storageKey('token'), token);
    if (refreshToken) {
      localStorage.setItem(storageKey('refresh_token'), refreshToken);
    } else {
      localStorage.removeItem(storageKey('refresh_token'));
    }
    if (typeof accessTokenExpiresAt === 'number') {
      localStorage.setItem(storageKey('access_token_expires_at'), String(accessTokenExpiresAt));
    } else {
      localStorage.removeItem(storageKey('access_token_expires_at'));
    }
    if (typeof refreshTokenExpiresAt === 'number') {
      localStorage.setItem(storageKey('refresh_token_expires_at'), String(refreshTokenExpiresAt));
    } else {
      localStorage.removeItem(storageKey('refresh_token_expires_at'));
    }
    localStorage.setItem(storageKey('user'), JSON.stringify(user));
    set({ token, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt, user, isAuthenticated: true });
  },
  updateTokens: (token, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt) => {
    localStorage.setItem(storageKey('token'), token);
    if (typeof refreshToken === 'string' && refreshToken) {
      localStorage.setItem(storageKey('refresh_token'), refreshToken);
    }
    if (typeof accessTokenExpiresAt === 'number') {
      localStorage.setItem(storageKey('access_token_expires_at'), String(accessTokenExpiresAt));
    }
    if (typeof refreshTokenExpiresAt === 'number') {
      localStorage.setItem(storageKey('refresh_token_expires_at'), String(refreshTokenExpiresAt));
    }
    set((state) => ({
      token,
      refreshToken: typeof refreshToken === 'string' && refreshToken ? refreshToken : state.refreshToken,
      accessTokenExpiresAt: typeof accessTokenExpiresAt === 'number' ? accessTokenExpiresAt : state.accessTokenExpiresAt,
      refreshTokenExpiresAt: typeof refreshTokenExpiresAt === 'number' ? refreshTokenExpiresAt : state.refreshTokenExpiresAt,
      isAuthenticated: true
    }));
  },
  clearAuth: () => {
    localStorage.removeItem(storageKey('token'));
    localStorage.removeItem(storageKey('refresh_token'));
    localStorage.removeItem(storageKey('access_token_expires_at'));
    localStorage.removeItem(storageKey('refresh_token_expires_at'));
    localStorage.removeItem(storageKey('user'));
    set({ token: null, refreshToken: null, accessTokenExpiresAt: null, refreshTokenExpiresAt: null, user: null, isAuthenticated: false });
  }
}));

export function hydrateAuth() {
  const token = localStorage.getItem(storageKey('token')) ?? localStorage.getItem(legacyStorageKey('token'));
  const refreshToken =
    localStorage.getItem(storageKey('refresh_token')) ?? localStorage.getItem(legacyStorageKey('refresh_token'));
  const accessTokenExpiresAtRaw =
    localStorage.getItem(storageKey('access_token_expires_at')) ??
    localStorage.getItem(legacyStorageKey('access_token_expires_at'));
  const refreshTokenExpiresAtRaw =
    localStorage.getItem(storageKey('refresh_token_expires_at')) ??
    localStorage.getItem(legacyStorageKey('refresh_token_expires_at'));
  const userJson = localStorage.getItem(storageKey('user')) ?? localStorage.getItem(legacyStorageKey('user'));
  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      const accessTokenExpiresAt = accessTokenExpiresAtRaw ? Number(accessTokenExpiresAtRaw) : null;
      const refreshTokenExpiresAt = refreshTokenExpiresAtRaw ? Number(refreshTokenExpiresAtRaw) : null;
      useAuthStore.setState({
        token,
        refreshToken,
        accessTokenExpiresAt: Number.isFinite(accessTokenExpiresAt) ? accessTokenExpiresAt : null,
        refreshTokenExpiresAt: Number.isFinite(refreshTokenExpiresAt) ? refreshTokenExpiresAt : null,
        user,
        isAuthenticated: true
      });
      localStorage.setItem(storageKey('token'), token);
      localStorage.setItem(storageKey('user'), userJson);
      if (refreshToken) localStorage.setItem(storageKey('refresh_token'), refreshToken);
      if (accessTokenExpiresAtRaw) localStorage.setItem(storageKey('access_token_expires_at'), accessTokenExpiresAtRaw);
      if (refreshTokenExpiresAtRaw) localStorage.setItem(storageKey('refresh_token_expires_at'), refreshTokenExpiresAtRaw);
    } catch {
      useAuthStore.setState({
        token: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        user: null,
        isAuthenticated: false
      });
    }
  }
}
