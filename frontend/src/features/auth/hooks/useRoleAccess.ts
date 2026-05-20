import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import {
  getDefaultHomePath,
  getRouteZone,
  normalizeRole,
  roleCanAccessZone,
  type AppRole,
  type RouteZone,
} from '../utils/roleAuth';

export function useRoleAccess() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return useMemo(() => {
    const role: AppRole = normalizeRole(user?.role);
    const zone: RouteZone = getRouteZone(pathname);
    const canAccess = roleCanAccessZone(role, zone);
    return {
      role,
      zone,
      canAccess,
      homePath: getDefaultHomePath(role),
    };
  }, [user?.role, pathname]);
}
