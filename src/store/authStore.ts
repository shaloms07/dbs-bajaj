import { create } from 'zustand';

export interface AuthUser {
  name: string;
  username?: string;
  email?: string;
  insurer?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser) => void;
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

function clearTokenStorage() {
  localStorage.removeItem(storageKey('token'));
  localStorage.removeItem(storageKey('refresh_token'));
  localStorage.removeItem(storageKey('access_token_expires_at'));
  localStorage.removeItem(storageKey('refresh_token_expires_at'));
  localStorage.removeItem(legacyStorageKey('token'));
  localStorage.removeItem(legacyStorageKey('refresh_token'));
  localStorage.removeItem(legacyStorageKey('access_token_expires_at'));
  localStorage.removeItem(legacyStorageKey('refresh_token_expires_at'));
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user) => {
    clearTokenStorage();
    localStorage.setItem(storageKey('user'), JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  clearAuth: () => {
    clearTokenStorage();
    localStorage.removeItem(storageKey('user'));
    localStorage.removeItem(legacyStorageKey('user'));
    set({ user: null, isAuthenticated: false });
  }
}));

export function hydrateAuth() {
  clearTokenStorage();

  const userJson = localStorage.getItem(storageKey('user')) ?? localStorage.getItem(legacyStorageKey('user'));

  if (!userJson) {
    return;
  }

  try {
    const user = JSON.parse(userJson) as AuthUser;
    if (!user || typeof user !== 'object' || typeof user.name !== 'string') {
      throw new Error('Invalid stored user');
    }

    useAuthStore.setState({ user, isAuthenticated: true });
    localStorage.setItem(storageKey('user'), JSON.stringify(user));
  } catch {
    localStorage.removeItem(storageKey('user'));
    localStorage.removeItem(legacyStorageKey('user'));
    useAuthStore.setState({ user: null, isAuthenticated: false });
  }
}
