import { Auth0Provider, type AppState } from '@auth0/auth0-react';
import { ReactNode, useMemo } from 'react';
import { getAuth0EnvConfig, logAuth0EnvDiagnostics } from '../config/auth0Env';
import { AuthConfigErrorScreen } from './AuthConfigErrorScreen';

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
  onRedirectCallback: (appState?: AppState) => void;
}

export const Auth0ProviderWithNavigate = ({
  children,
  onRedirectCallback,
}: Auth0ProviderWithNavigateProps) => {
  const config = useMemo(() => getAuth0EnvConfig(), []);

  if (!config.isConfigured) {
    logAuth0EnvDiagnostics(config);
    return <AuthConfigErrorScreen diagnostics={config.diagnostics} />;
  }

  const authorizationParams: Record<string, string> = {
    redirect_uri: config.redirectUri,
    scope: 'openid profile email',
  };
  if (config.audience) {
    authorizationParams.audience = config.audience;
  }

  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      cacheLocation="localstorage"
      useRefreshTokens
      authorizationParams={authorizationParams}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
