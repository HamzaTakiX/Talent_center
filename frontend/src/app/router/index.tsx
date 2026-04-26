import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from '../../features/auth/pages/LoginPage';
import ConfirmIdentityPage from '../../features/auth/pages/ConfirmIdentityPage';
import CompleteProfilePage from '../../features/auth/pages/CompleteProfilePage';
import CallbackPage from '../../features/auth/pages/CallbackPage';

// Admin Pages
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage';

// Student Pages
import StudentDashboardPage from '../../features/student/pages/StudentDashboardPage';

// CV Pages
import CVListPage from '../../features/cv/pages/CVListPage';
import CVEditorPage from '../../features/cv/pages/CVEditorPage';
import PublicCvPage from '../../features/cv/pages/PublicCvPage';

// Hooks
import { useAuth } from '../../features/auth/hooks/useAuth';

// Guards
import { GuestGuard } from './guards/GuestGuard';
import { OnboardingGuard } from './guards/OnboardingGuard';
import { AuthGuard } from './guards/AuthGuard';

const DashboardRedirect = () => {
  const { user } = useAuth();
  const userRole = user?.role?.toUpperCase();

  if (userRole === 'STUDENT') {
    return <Navigate to="/student-dashboard" replace />;
  }

  // Admin and other roles go to admin dashboard
  return <Navigate to="/admin-dashboard" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/callback',
    element: <CallbackPage />
  },

  {
    path: '/cv/public/:token',
    element: <PublicCvPage />
  },

  {
    element: <GuestGuard />,
    children: [
      {
        path: '/login',
        element: <LoginPage />
      }
    ]
  },
  {
    element: <OnboardingGuard />,
    children: [
      {
        path: '/confirm-identity',
        element: <ConfirmIdentityPage />
      },
      {
        path: '/complete-profile',
        element: <CompleteProfilePage />
      }
    ]
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <DashboardRedirect />
      },
      {
        path: '/student-dashboard',
        element: <StudentDashboardPage />
      },
      {
        path: '/admin-dashboard',
        element: <AdminDashboardPage />
      },
      {
        path: '/cv',
        element: <CVListPage />
      },
      {
        path: '/cv/:id/edit',
        element: <CVEditorPage />
      },
      {
        path: '/cv-editor',
        element: <CVEditorPage />
      }
    ]
  }
]);
