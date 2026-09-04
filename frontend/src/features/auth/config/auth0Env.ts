/**
 * Auth0 SPA configuration — frontend only (no client secret).
 * Sources (in order): import.meta.env (Vite build) → window.__TC_AUTH0_ENV__ (tc-auth-env.js).
 */

import { getAppCallbackUrl, getAppOrigin } from './appEnv';

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

type Auth0EnvKey =
  | 'VITE_AUTH0_DOMAIN'
  | 'VITE_AUTH0_CLIENT_ID'
  | 'VITE_AUTH0_AUDIENCE'
  | 'VITE_AUTH0_CONNECTION';

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

function readViteEnv(key: Auth0EnvKey): string {
  const fromMeta = import.meta.env[key];
  if (typeof fromMeta === 'string' && fromMeta.length > 0) {
    return readEnv(fromMeta);
  }

  if (typeof window !== 'undefined') {
    const runtime = window.__TC_AUTH0_ENV__?.[key];
    if (typeof runtime === 'string' && runtime.length > 0) {
      return readEnv(runtime);
    }
  }

  return '';
}

export type Auth0EnvConfig = {
  domain: string;
  clientId: string;
  audience?: string;
  connection?: string;
  /** Public app origin used for Auth0 redirect_uri / logout. */
  appOrigin: string;
  redirectUri: string;
  isConfigured: boolean;
  /** Diagnostic snapshot for error UI / console (values masked). */
  diagnostics: {
    domainFromMeta: boolean;
    clientIdFromMeta: boolean;
    domainFromRuntime: boolean;
    clientIdFromRuntime: boolean;
    mode: string;
    prod: boolean;
  };
};

let diagnosticsLogged = false;

/** TEMP: production-safe diagnostic logs (remove after Vercel env is confirmed). */
export function logAuth0EnvDiagnostics(config: Auth0EnvConfig): void {
  if (diagnosticsLogged) return;
  diagnosticsLogged = true;

  const mask = (v: string) =>
    v.length > 10 ? `${v.slice(0, 8)}…(${v.length})` : v ? '(short)' : '(empty)';

  const payload = {
    configured: config.isConfigured,
    import_meta: {
      VITE_AUTH0_DOMAIN: mask(readEnv(import.meta.env.VITE_AUTH0_DOMAIN)),
      VITE_AUTH0_CLIENT_ID: mask(readEnv(import.meta.env.VITE_AUTH0_CLIENT_ID)),
      VITE_APP_URL: mask(readEnv(import.meta.env.VITE_APP_URL)),
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
    },
    runtime_script: {
      VITE_AUTH0_DOMAIN: mask(readEnv(window.__TC_AUTH0_ENV__?.VITE_AUTH0_DOMAIN)),
      VITE_AUTH0_CLIENT_ID: mask(readEnv(window.__TC_AUTH0_ENV__?.VITE_AUTH0_CLIENT_ID)),
      scriptPresent: typeof window.__TC_AUTH0_ENV__ !== 'undefined',
    },
    resolved: {
      domain: mask(config.domain),
      clientId: mask(config.clientId),
      appOrigin: config.appOrigin,
      redirectUri: config.redirectUri,
    },
    sources: config.diagnostics,
  };

  console.info('[Auth0 env diagnostic]', payload);
}

export function getAuth0MissingKeys(
  diagnostics: Auth0EnvConfig['diagnostics'],
): Array<'VITE_AUTH0_DOMAIN' | 'VITE_AUTH0_CLIENT_ID'> {
  const missing: Array<'VITE_AUTH0_DOMAIN' | 'VITE_AUTH0_CLIENT_ID'> = [];
  const hasDomain = diagnostics.domainFromMeta || diagnostics.domainFromRuntime;
  const hasClientId = diagnostics.clientIdFromMeta || diagnostics.clientIdFromRuntime;
  if (!hasDomain) missing.push('VITE_AUTH0_DOMAIN');
  if (!hasClientId) missing.push('VITE_AUTH0_CLIENT_ID');
  return missing;
}

export function getAuth0EnvConfig(): Auth0EnvConfig {
  const domainMeta = readEnv(import.meta.env.VITE_AUTH0_DOMAIN);
  const clientIdMeta = readEnv(import.meta.env.VITE_AUTH0_CLIENT_ID);
  const domainRuntime =
    typeof window !== 'undefined'
      ? readEnv(window.__TC_AUTH0_ENV__?.VITE_AUTH0_DOMAIN)
      : '';
  const clientIdRuntime =
    typeof window !== 'undefined'
      ? readEnv(window.__TC_AUTH0_ENV__?.VITE_AUTH0_CLIENT_ID)
      : '';

  const domain = readViteEnv('VITE_AUTH0_DOMAIN');
  const clientId = readViteEnv('VITE_AUTH0_CLIENT_ID');
  const audience = readViteEnv('VITE_AUTH0_AUDIENCE') || undefined;
  const connection = readViteEnv('VITE_AUTH0_CONNECTION') || undefined;
  const appOrigin = getAppOrigin();

  const config: Auth0EnvConfig = {
    domain,
    clientId,
    audience,
    connection,
    appOrigin,
    redirectUri: getAppCallbackUrl(),
    isConfigured: Boolean(domain && clientId),
    diagnostics: {
      domainFromMeta: Boolean(domainMeta),
      clientIdFromMeta: Boolean(clientIdMeta),
      domainFromRuntime: Boolean(domainRuntime),
      clientIdFromRuntime: Boolean(clientIdRuntime),
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD,
    },
  };

  if (import.meta.env.PROD) {
    logAuth0EnvDiagnostics(config);
  }

  return config;
}

/** Auth0 Microsoft/social connection name for loginWithRedirect (from env only). */
export function getAuth0Connection(): string {
  return getAuth0EnvConfig().connection ?? '';
}
