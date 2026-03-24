import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Auth Pages
import LoginPage from '../../features/auth/pages/LoginPage';
import ConfirmIdentityPage from '../../features/auth/pages/ConfirmIdentityPage';
import CompleteProfilePage from '../../features/auth/pages/CompleteProfilePage';
import CallbackPage from '../../features/auth/pages/CallbackPage';

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
        element: <div>Welcome to the Dashboard!</div>
      }
    ]
  }
]);
