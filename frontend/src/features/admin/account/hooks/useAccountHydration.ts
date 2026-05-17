import { useAuth } from '../../../auth/hooks/useAuth';

/** True once auth user is loaded (replaces artificial delay). */
export const useAccountHydration = (): boolean => {
  const { isLoading, user, isAuthenticated } = useAuth();
  return !isLoading && isAuthenticated && user != null;
};
