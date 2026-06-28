import { getApiBaseUrl } from './config';

const DEFAULT_PROD_BACKEND = 'https://talentcenter-production.up.railway.app';

/**
 * Backend origin without /api (for /media/… URLs).
 */
export function getBackendOrigin(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin;
  }
  const fromEnv = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
  if (fromEnv) {
    return fromEnv;
  }
  const apiBase = getApiBaseUrl();
  if (apiBase.endsWith('/api')) {
    return apiBase.slice(0, -4);
  }
  return apiBase.replace(/\/api\/?$/, '') || DEFAULT_PROD_BACKEND;
}

/**
 * Resolve avatar or media path to an absolute URL on the Railway backend.
 */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path?.trim()) {
    return null;
  }
  const value = path.trim();
  if (/^(https?:|data:|blob:)/i.test(value)) {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      try {
        const parsed = new URL(value);
        if (parsed.pathname.startsWith('/media/')) {
          return `${parsed.pathname}${parsed.search}`;
        }
      } catch {
        return value;
      }
    }
    return value;
  }
  const origin = getBackendOrigin();
  if (value.startsWith('/')) {
    return `${origin}${value}`;
  }
  return `${origin}/media/${value.replace(/^\/+/, '')}`;
}
