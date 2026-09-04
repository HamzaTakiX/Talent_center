import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import {
  getRouteZone,
  normalizeRole,
  roleCanAccessZone,
} from '../../../features/auth/utils/roleAuth';
import { canAccessAdminPath } from '../../../features/auth/utils/modulePermissions';
import { AuthLoadingGate } from './AuthLoadingGate';

/**
 * Enforces role ↔ URL isolation on every navigation (including browser back/forward),
 * then module-level authorization for administrators.
 * Must sit inside AuthGuard after the user is authenticated.
 */
export const RouteAccessGuard = () => {
  const { user, isLoading, isAuthReady } = useAuth();
  const location = useLocation();

  if (import.meta.env.VITE_FRONTEND_ONLY_ADMIN === 'true') {
    return <Outlet />;
  }

  if (!isAuthReady && isLoading) {
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

  if (zone === 'admin' && !canAccessAdminPath(user, location.pathname)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
