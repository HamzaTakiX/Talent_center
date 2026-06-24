import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import {
  isOnboardingCvPending,
  ONBOARDING_CV_EDITOR_PATH,
} from '../../../features/auth/utils/onboardingCvGate';
import { normalizeRole } from '../../../features/auth/utils/roleAuth';
import { AuthLoadingGate } from './AuthLoadingGate';

const CV_ONBOARDING_GATE_PATHS = new Set(['/', '/student-dashboard']);

export const AuthGuard = () => {
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

  const userRole = normalizeRole(user.role);
  const isStudent = userRole === 'STUDENT';

  if (isStudent) {
    if (!user.student_profile?.identity_confirmed) {
      return <Navigate to="/confirm-identity" replace />;
    }

    if (!user.student_profile?.profile_completed) {
      return <Navigate to="/complete-profile" replace />;
    }

    if (
      isOnboardingCvPending() &&
      CV_ONBOARDING_GATE_PATHS.has(location.pathname)
    ) {
      return <Navigate to={ONBOARDING_CV_EDITOR_PATH} replace />;
    }
  }

  return <Outlet />;
};
