import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Auth Pages
import LoginPage from '../../features/auth/pages/LoginPage';
import ConfirmIdentityPage from '../../features/auth/pages/ConfirmIdentityPage';
import CompleteProfilePage from '../../features/auth/pages/CompleteProfilePage';
import CallbackPage from '../../features/auth/pages/CallbackPage';

// Admin Pages
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage';

// CV Pages
import CVListPage from '../../features/cv/pages/CVListPage';
import CVEditorPage from '../../features/cv/pages/CVEditorPage';
import PublicCvPage from '../../features/cv/pages/PublicCvPage';

// Guards
import { GuestGuard } from './guards/GuestGuard';
import { OnboardingGuard } from './guards/OnboardingGuard';
import { AuthGuard } from './guards/AuthGuard';

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
