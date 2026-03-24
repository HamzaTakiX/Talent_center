import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export const OnboardingGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const identityConfirmed = user.student_profile?.identity_confirmed;
  const profileCompleted = user.student_profile?.profile_completed;

  // Onboarding sequence completed entirely. Redirect back to core app.
  if (identityConfirmed && profileCompleted) {
    return <Navigate to="/" replace />;
  }

  // Current page is Complete Profile, but Identity hasn't been confirmed yet. Rollback!
  if (location.pathname === '/complete-profile' && !identityConfirmed) {
    return <Navigate to="/confirm-identity" replace />;
  }

  // Current page is Confirm Identity, but it has already been confirmed. Spring forward!
  if (location.pathname === '/confirm-identity' && identityConfirmed) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};
