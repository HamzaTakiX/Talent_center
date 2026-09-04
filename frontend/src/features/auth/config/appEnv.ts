/**
 * Public app origin for local/prod — single source for Auth0 callbacks and absolute links.
 * Prefer VITE_APP_URL; fall back to window.location.origin at runtime.
 */

declare global {
  interface Window {
    __TC_AUTH0_ENV__?: Partial<
      Record<
        | 'VITE_AUTH0_DOMAIN'
        | 'VITE_AUTH0_CLIENT_ID'
        | 'VITE_AUTH0_AUDIENCE'
        | 'VITE_AUTH0_CONNECTION'
        | 'VITE_API_URL'
        | 'VITE_APP_URL',
        string
      >
    >;
  }
}

function readEnv(value: string | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function readAppUrlFromEnv(): string {
  const fromMeta = readEnv(import.meta.env.VITE_APP_URL);
  if (fromMeta) return fromMeta.replace(/\/+$/, '');

  if (typeof window !== 'undefined') {
    const runtime = readEnv(window.__TC_AUTH0_ENV__?.VITE_APP_URL);
    if (runtime) return runtime.replace(/\/+$/, '');
  }
  return '';
}

/** Canonical public origin (no trailing slash), e.g. http://talent-center.localhost:5173 */
export function getAppOrigin(): string {
  const configured = readAppUrlFromEnv();
  if (configured) return configured;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://talent-center.localhost:5173';
}

export function getAppCallbackUrl(): string {
  return `${getAppOrigin()}/callback`;
}

export function getAppLoginUrl(): string {
  return `${getAppOrigin()}/login`;
}
