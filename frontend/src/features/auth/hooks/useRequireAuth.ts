import { useAuth } from './useAuth';

/**
 * Consolidated auth gate state for guards and pages.
 */
export function useRequireAuth() {
  const { user, isLoading, isAuthReady, isAuthenticated } = useAuth();

  const isResolving = !isAuthReady && isLoading;
  const isGuest = isAuthReady && !user;

  return {
    user,
    isLoading,
    isAuthReady,
    isAuthenticated,
    isResolving,
    isGuest,
  };
}
