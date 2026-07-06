import { useAuthStore } from '../store/authStore';
import { getBrandingConfig, resolveBrandingForUser } from './config';

export function useBranding() {
  const user = useAuthStore((state) => state.user);
  return resolveBrandingForUser(user);
}

export function useDefaultBranding() {
  return getBrandingConfig();
}
