import { Auth0Provider } from '@auth0/auth0-react';
import React, { ReactNode } from 'react';

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
  onRedirectCallback: (appState?: any) => void;
}

export const Auth0ProviderWithNavigate = ({ children, onRedirectCallback }: Auth0ProviderWithNavigateProps) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // Wait for the environment variables to be available before rendering the application.
  // In development, sometimes strict mode causes the initial render to not have these if they are fetched asynchronously.
  // Although Vite injects them statically.
  if (!domain || !clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">Auth0 Configuration Missing</h2>
          <p className="text-gray-600 mt-2">Please provide VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in your .env.local file.</p>
        </div>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + '/callback',
        audience: audience,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
