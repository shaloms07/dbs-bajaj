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
  setAuth: (_token, user) => {
    localStorage.setItem(storageKey('user'), JSON.stringify(user));
    set({ token: null, refreshToken: null, accessTokenExpiresAt: null, refreshTokenExpiresAt: null, user, isAuthenticated: true });
  },
  updateTokens: () => {
    // No-op: we do not store tokens
  },
  clearAuth: () => {
    localStorage.removeItem(storageKey('token'));
    localStorage.removeItem(storageKey('refresh_token'));
    localStorage.removeItem(storageKey('access_token_expires_at'));
    localStorage.removeItem(storageKey('refresh_token_expires_at'));
    localStorage.removeItem(storageKey('user'));
    localStorage.removeItem(legacyStorageKey('token'));
    localStorage.removeItem(legacyStorageKey('refresh_token'));
    localStorage.removeItem(legacyStorageKey('access_token_expires_at'));
    localStorage.removeItem(legacyStorageKey('refresh_token_expires_at'));
    localStorage.removeItem(legacyStorageKey('user'));
    set({ token: null, refreshToken: null, accessTokenExpiresAt: null, refreshTokenExpiresAt: null, user: null, isAuthenticated: false });
  }
}));

export function hydrateAuth() {
  const userJson = localStorage.getItem(storageKey('user')) ?? localStorage.getItem(legacyStorageKey('user'));
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      useAuthStore.setState({
        token: null,
        refreshToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        user,
        isAuthenticated: true
      });
      localStorage.setItem(storageKey('user'), userJson);
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

