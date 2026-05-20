import { useAuth } from './useAuth';
import { hasPersistedAccessToken } from '../utils/authSessionCache';

/**
 * Consolidated auth gate state for guards and pages.
 */
export function useRequireAuth() {
  const { user, isLoading, isAuthReady, isAuthenticated } = useAuth();
  const hasToken = hasPersistedAccessToken();

  const isResolving = !isAuthReady && (isLoading || hasToken);
  const isGuest = isAuthReady && !user;

  return {
    user,
    isLoading,
    isAuthReady,
    isAuthenticated,
    isResolving,
    isGuest,
    hasToken,
  };
}
