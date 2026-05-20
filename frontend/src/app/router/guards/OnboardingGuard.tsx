import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { ONBOARDING_CV_EDITOR_PATH } from '../../../features/auth/utils/onboardingCvGate';

let lastIdentityConfirmedAt: number | null = null;

export const markIdentityJustConfirmed = () => {
  lastIdentityConfirmedAt = Date.now();
};

export const OnboardingGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (!user) {
    if (isLoading || isAuthenticated) {
      return <Outlet />;
    }
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toUpperCase();
  const isNonStudent =
    userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'SUPERVISOR';

  if (isNonStudent) {
    if (location.pathname === '/confirm-identity' || location.pathname === '/complete-profile') {
      return <Navigate to="/" replace />;
    }
  }

  const identityConfirmed = user.student_profile?.identity_confirmed;
  const profileCompleted = user.student_profile?.profile_completed;

  if (identityConfirmed && profileCompleted && location.pathname !== '/complete-profile') {
    return <Navigate to={ONBOARDING_CV_EDITOR_PATH} replace />;
  }

  if (location.pathname === '/complete-profile' && !identityConfirmed) {
    return <Navigate to="/confirm-identity" replace />;
  }

  const justSaved = lastIdentityConfirmedAt && Date.now() - lastIdentityConfirmedAt < 3000;
  if (location.pathname === '/confirm-identity' && identityConfirmed && !profileCompleted && !justSaved) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};
