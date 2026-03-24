import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export const GuestGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated && user) {
    // If authenticated, we check if they completed onboarding.
    if (!user.student_profile?.identity_confirmed) {
      return <Navigate to="/confirm-identity" replace />;
    }
    if (!user.student_profile?.profile_completed) {
      return <Navigate to="/complete-profile" replace />;
    }
    // Fully onboarded -> redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
