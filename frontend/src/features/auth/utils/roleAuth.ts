import {
  isOnboardingCvPending,
  ONBOARDING_CV_EDITOR_PATH,
} from './onboardingCvGate';

export type AppRole = 'STUDENT' | 'ADMIN' | 'STAFF' | 'SUPERVISOR' | 'UNKNOWN';

export const ADMIN_APP_ROLES: AppRole[] = ['ADMIN', 'STAFF', 'SUPERVISOR'];

export type RouteZone = 'neutral' | 'admin' | 'student' | 'cv';

export function normalizeRole(role: string | undefined): AppRole {
  const value = role?.toUpperCase().replace(/[\s-]+/g, '_');
  if (value === 'STUDENT') return 'STUDENT';
  if (value === 'SUPERVISOR' || value === 'ENCADRANT') return 'SUPERVISOR';
  if (
    value === 'ADMIN' ||
    value === 'STAFF' ||
    value === 'SUPER_ADMIN' ||
    value === 'SUPERADMIN'
  ) {
    return value === 'STAFF' ? 'STAFF' : 'ADMIN';
  }
  return 'UNKNOWN';
}

export function isAdminAppRole(role: AppRole): boolean {
  return ADMIN_APP_ROLES.includes(role);
}

export function getRouteZone(pathname: string): RouteZone {
  if (pathname === '/' || pathname === '') {
    return 'neutral';
  }
  if (pathname.startsWith('/admin') || pathname === '/admin-dashboard') {
    return 'admin';
  }
  if (pathname.startsWith('/student') || pathname === '/student-dashboard') {
    return 'student';
  }
  if (pathname.startsWith('/cv') || pathname === '/cv-editor') {
    return 'cv';
  }
  return 'neutral';
}

export function roleCanAccessZone(role: AppRole, zone: RouteZone): boolean {
  if (zone === 'neutral') {
    return true;
  }
  if (zone === 'admin') {
    return isAdminAppRole(role);
  }
  if (zone === 'student' || zone === 'cv') {
    return role === 'STUDENT';
  }
  return false;
}

export function getDefaultHomePath(role: AppRole): string {
  if (import.meta.env.VITE_FRONTEND_ONLY_ADMIN === 'true') {
    return '/admin/dashboard';
  }
  if (role === 'STUDENT') {
    if (isOnboardingCvPending()) {
      return ONBOARDING_CV_EDITOR_PATH;
    }
    return '/student-dashboard';
  }
  if (isAdminAppRole(role)) {
    return '/admin/dashboard';
  }
  return '/login';
}
