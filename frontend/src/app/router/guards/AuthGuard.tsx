import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export const AuthGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Prevent accessing protected dashboard without full onboarding
  if (!user.student_profile?.identity_confirmed) {
    return <Navigate to="/confirm-identity" replace />;
  }
  
  if (!user.student_profile?.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};
