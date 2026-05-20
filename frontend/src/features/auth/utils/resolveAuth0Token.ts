import type { GetTokenSilentlyOptions } from '@auth0/auth0-react';

type GetAccessTokenSilently = (
  options?: GetTokenSilentlyOptions,
) => Promise<string | { access_token?: string; id_token?: string }>;

type GetIdTokenClaims = () => Promise<{ __raw?: string } | undefined>;

/**
 * Returns a JWT suitable for backend /auth/providers/auth0/exchange.
 * Prefers access_token; falls back to id_token when the SPA has no API audience.
 */
export async function resolveAuth0ExchangeToken(
  getAccessTokenSilently: GetAccessTokenSilently,
  getIdTokenClaims: GetIdTokenClaims,
): Promise<string> {
  try {
    const detailed = await getAccessTokenSilently({ detailedResponse: true });
    if (typeof detailed === 'object' && detailed) {
      if (detailed.access_token) return detailed.access_token;
      if (detailed.id_token) return detailed.id_token;
    }
    if (typeof detailed === 'string' && detailed) {
      return detailed;
    }
  } catch {
    // fall through
  }

  try {
    const token = await getAccessTokenSilently();
    if (typeof token === 'string' && token) return token;
  } catch {
    // fall through
  }

  const claims = await getIdTokenClaims();
  if (claims?.__raw) {
    return claims.__raw;
  }

  throw new Error('Unable to obtain Auth0 token for exchange');
}
