import { RouterProvider } from 'react-router-dom';
import type { AppState } from '@auth0/auth0-react';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { router } from './router';
import { Auth0ProviderWithNavigate } from '../features/auth/components/Auth0ProviderWithNavigate';
import LanguageProvider from '../i18n/LanguageProvider';
import { AuthThemeProvider } from '../features/auth/context/AuthThemeContext';
import '../i18n/config';

const onRedirectCallback = (appState?: AppState) => {
  const returnTo = appState?.returnTo;
  const target =
    returnTo && returnTo !== '/callback' && returnTo !== '/login'
      ? returnTo
      : '/';
  window.history.replaceState({}, document.title, target);
};

export const App = () => {
  return (
    <LanguageProvider>
      <AuthThemeProvider>
        <Auth0ProviderWithNavigate onRedirectCallback={onRedirectCallback}>
          <AuthProvider>
            <RouterProvider router={router} future={{ v7_startTransition: true }} />
          </AuthProvider>
        </Auth0ProviderWithNavigate>
      </AuthThemeProvider>
    </LanguageProvider>
  );
};
