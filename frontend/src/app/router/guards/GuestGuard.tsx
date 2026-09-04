import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { getDefaultHomePath, normalizeRole } from '../../../features/auth/utils/roleAuth';
import { AuthLoadingGate } from './AuthLoadingGate';

export const GuestGuard = () => {
  const { isAuthenticated, user, isLoading, isAuthReady } = useAuth();

  if (!isAuthReady && isLoading) {
    return <AuthLoadingGate />;
  }

  if (isAuthReady && isAuthenticated && user) {
    const role = normalizeRole(user.role);
    if (role === 'STUDENT') {
      if (!user.student_profile?.identity_confirmed) {
        return <Navigate to="/confirm-identity" replace />;
      }
      if (!user.student_profile?.profile_completed) {
        return <Navigate to="/complete-profile" replace />;
      }
    }
    return <Navigate to={getDefaultHomePath(role)} replace />;
  }

  return <Outlet />;
};
