import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export const AuthGuard = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }} />
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
  const isStudent = userRole === 'STUDENT';
  
  // Only students need to complete onboarding
  if (isStudent) {
    // Prevent accessing protected dashboard without full onboarding
    if (!user.student_profile?.identity_confirmed) {
      return <Navigate to="/confirm-identity" replace />;
    }
    
    if (!user.student_profile?.profile_completed) {
      return <Navigate to="/complete-profile" replace />;
    }
  }
  // Non-students (ADMIN, STAFF, SUPERVISOR) skip onboarding checks

  return <Outlet />;
};
