import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import {
  getDefaultHomePath,
  getRouteZone,
  normalizeRole,
  roleCanAccessZone,
} from '../../../features/auth/utils/roleAuth';
import { AuthLoadingGate } from './AuthLoadingGate';

/**
 * Enforces role ↔ URL isolation on every navigation (including browser back/forward).
 * Must sit inside AuthGuard after the user is authenticated.
 */
export const RouteAccessGuard = () => {
  const { user, isAuthReady } = useAuth();
  const location = useLocation();

  if (import.meta.env.VITE_FRONTEND_ONLY_ADMIN === 'true') {
    return <Outlet />;
  }

  if (!isAuthReady) {
    return <AuthLoadingGate />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = normalizeRole(user.role);
  const zone = getRouteZone(location.pathname);

  if (!roleCanAccessZone(role, zone)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
