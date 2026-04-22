import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';

// Track when identity was last confirmed to prevent immediate auto-redirect
let lastIdentityConfirmedAt: number | null = null;

export const markIdentityJustConfirmed = () => {
  lastIdentityConfirmedAt = Date.now();
};

export const OnboardingGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
          </div>
          <span className="text-indigo-600 font-medium text-sm tracking-wide">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toUpperCase();
  
  // Non-student roles (ADMIN, STAFF, SUPERVISOR) skip onboarding entirely
  const isNonStudent = userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'SUPERVISOR';
  
  if (isNonStudent) {
    // Redirect admins/staff/supervisors away from onboarding pages to dashboard
    if (location.pathname === '/confirm-identity' || location.pathname === '/complete-profile') {
      return <Navigate to="/" replace />;
    }
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
  // BUT: Don't redirect immediately after user just saved (allow them to see success message)
  const justSaved = lastIdentityConfirmedAt && (Date.now() - lastIdentityConfirmedAt < 3000);
  if (location.pathname === '/confirm-identity' && identityConfirmed && !justSaved) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};
