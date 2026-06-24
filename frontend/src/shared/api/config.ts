/** Django auth login — must match `path('login', ...)` in apps.authentication.urls (no trailing slash). */
export const AUTH_LOGIN_PATH = '/auth/login';

/** Same-origin API path in dev (Vite proxies /api → localhost:8000). */
const DEV_PROXY_API_BASE = '/api';

/**
 * Normalize VITE_API_URL (no trailing slash, no accidental "VITE_API_URL=..." paste).
 */
export function sanitizeApiBaseUrl(raw: string | undefined): string {
  if (!raw) return '';
  let value = raw.trim();
  const embedded = value.match(/VITE_API_URL=(.+)/i);
  if (embedded) {
    value = embedded[1].trim();
  }
  return value.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return DEV_PROXY_API_BASE;
  }
  const fromEnv = sanitizeApiBaseUrl(import.meta.env.VITE_API_URL);
  if (fromEnv) {
    return fromEnv;
  }
  throw new Error(
    'VITE_API_URL is required for production builds (e.g. https://your-app.up.railway.app/api).',
  );
}

/** `${VITE_API_URL}/auth/login` → e.g. https://talentcenter-production.up.railway.app/api/auth/login */
export function getAuthLoginUrl(): string {
  return `${getApiBaseUrl()}${AUTH_LOGIN_PATH}`;
}

export function buildApiUrl(path: string): string {
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${segment}`;
}

/** WebSocket origin derived from VITE_API_URL (http→ws, https→wss). */
export function getWsOrigin(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  const api = getApiBaseUrl();
  const httpOrigin = api.replace(/\/api\/?$/, '');
  if (httpOrigin.startsWith('https://')) {
    return httpOrigin.replace(/^https:\/\//, 'wss://');
  }
  if (httpOrigin.startsWith('http://')) {
    return httpOrigin.replace(/^http:\/\//, 'ws://');
  }
  return 'ws://localhost:8000';
}

export function buildWsUrl(path: string): string {
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${getWsOrigin()}${segment}`;
}

/** Log exact login URL once in production (browser console). */
export function logAuthLoginUrlInProduction(): void {
  if (!import.meta.env.PROD) return;
  console.info('[Talent Center] POST login URL:', getAuthLoginUrl());
}

if (import.meta.env.PROD) {
  logAuthLoginUrlInProduction();
}
