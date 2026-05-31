import { normalizeRole } from '../../auth/utils/roleAuth';
import { STUDENT_DASHBOARD_PATH } from '../../student/config/studentNavConfig';

export type CvReturnState = {
  returnTo?: string;
};

/** Where the CV header back arrow should navigate. */
export function getCvBackTarget(
  pathname: string,
  role: string | undefined,
  returnTo?: string | null,
): string {
  if (returnTo && returnTo.startsWith('/')) {
    return returnTo;
  }

  const normalized = normalizeRole(role);

  if (normalized === 'STUDENT') {
    if (pathname === '/cv' || pathname === '/cv-editor') {
      return STUDENT_DASHBOARD_PATH;
    }
    const editMatch = pathname.match(/^\/cv\/([^/]+)\/edit$/);
    if (editMatch) {
      return '/cv';
    }
    const finalizeMatch = pathname.match(/^\/cv\/([^/]+)\/finalize$/);
    if (finalizeMatch) {
      return `/cv/${finalizeMatch[1]}/edit`;
    }
    return STUDENT_DASHBOARD_PATH;
  }

  if (pathname === '/cv-editor') {
    return '/cv';
  }

  return '/cv';
}
