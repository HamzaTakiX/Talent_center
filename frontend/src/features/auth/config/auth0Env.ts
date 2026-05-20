/**
 * Auth0 SPA configuration — frontend only (no client secret).
 * Values are injected at build time via Vite `VITE_*` variables.
 */

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

export type Auth0EnvConfig = {
  domain: string;
  clientId: string;
  audience?: string;
  redirectUri: string;
  isConfigured: boolean;
};

export function getAuth0EnvConfig(): Auth0EnvConfig {
  const domain = readEnv(import.meta.env.VITE_AUTH0_DOMAIN);
  const clientId = readEnv(import.meta.env.VITE_AUTH0_CLIENT_ID);
  const audience = readEnv(import.meta.env.VITE_AUTH0_AUDIENCE) || undefined;
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  return {
    domain,
    clientId,
    audience,
    redirectUri: `${origin}/callback`,
    isConfigured: Boolean(domain && clientId),
  };
}
