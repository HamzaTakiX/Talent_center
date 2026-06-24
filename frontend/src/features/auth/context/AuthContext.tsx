import { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { isAxiosError } from 'axios';
import { User } from '../types';
import { authApi } from '../api';
import { getAuth0EnvConfig } from '../config/auth0Env';
import {
  canRestoreSessionFromCache,
  hasPersistedAccessToken,
  readCachedAuthUser,
  writeCachedAuthUser,
} from '../utils/authSessionCache';
import {
  clearPersistedAuthTokens,
  refreshAccessToken,
} from '../utils/authTokenRefresh';
import { clearRoleScopedStorage } from '../utils/clearRoleScopedStorage';
import { AUTH_SESSION_EXPIRED_EVENT } from '../utils/authSessionEvents';
import { resolveAuth0ExchangeToken } from '../utils/resolveAuth0Token';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once JWT/session resolution finished (success or hard failure). */
  isAuthReady: boolean;
  authError: string | null;
  user: User | null;
  login: (returnTo?: string) => void;
  legacyLogin: (token: string, userData: User, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const isFrontendOnlyAdmin = import.meta.env.VITE_FRONTEND_ONLY_ADMIN === 'true';

const fakeAdminUser: User = {
  id: 999,
  email: 'admin.demo@talentcenter.local',
  role: 'ADMIN',
  full_name: 'Super Admin',
  account_status: 'ACTIVE',
  platform_access_granted: true,
  profile: {
    id: 1,
    first_name: 'Super',
    last_name: 'Admin',
  },
};

async function loadCurrentUser(): Promise<User> {
  return authApi.me();
}

async function restoreSessionWithRefresh(): Promise<User | null> {
  if (!hasPersistedAccessToken()) return null;

  try {
    return await loadCurrentUser();
  } catch (error) {
    const unauthorized = isAxiosError(error) && error.response?.status === 401;
    if (!unauthorized) {
      return null;
    }
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) return null;

  try {
    return await loadCurrentUser();
  } catch {
    return refreshed.user ?? null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth0Configured = getAuth0EnvConfig().isConfigured;
  const {
    isAuthenticated: isAuth0Authenticated,
    isLoading: isAuth0Loading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    getIdTokenClaims,
  } = useAuth0();

  const hasCachedSession = canRestoreSessionFromCache();

  const [user, setUserState] = useState<User | null>(() =>
    isFrontendOnlyAdmin ? fakeAdminUser : readCachedAuthUser(),
  );
  const [isBackendLoading, setIsBackendLoading] = useState(
    () => !isFrontendOnlyAdmin && hasPersistedAccessToken(),
  );
  /** Ready for routing: optimistic when token + cached user exist; blocking only on cold bootstrap. */
  const [isAuthReady, setIsAuthReady] = useState(
    () => isFrontendOnlyAdmin || !hasPersistedAccessToken() || hasCachedSession,
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const hydrationRef = useRef<'idle' | 'backend' | 'auth0' | 'done'>('idle');

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    writeCachedAuthUser(next);
  }, []);

  const clearLocalAuth = useCallback(() => {
    clearPersistedAuthTokens();
    clearRoleScopedStorage();
    setUser(null);
    hydrationRef.current = 'idle';
    setIsAuthReady(true);
  }, [setUser]);

  const hydrateFromBackendToken = useCallback(async () => {
    if (!hasPersistedAccessToken()) {
      setIsBackendLoading(false);
      setIsAuthReady(true);
      return;
    }

    const restored = await restoreSessionWithRefresh();
    if (restored) {
      setUser(restored);
    } else {
      clearLocalAuth();
    }
    setIsBackendLoading(false);
    setIsAuthReady(true);
  }, [clearLocalAuth, setUser]);

  const fetchBackendUser = useCallback(async () => {
    try {
      setAuthError(null);
      setIsBackendLoading(true);
      if (!canRestoreSessionFromCache()) {
        setIsAuthReady(false);
      }
      const auth0Token = await resolveAuth0ExchangeToken(
        getAccessTokenSilently,
        getIdTokenClaims,
      );
      const session = await authApi.auth0Exchange(auth0Token);
      localStorage.setItem('access_token', session.access);
      if (session.refresh) {
        localStorage.setItem('refresh_token', session.refresh);
      }
      setUser(session.user);
    } catch (error) {
      console.error('Failed to exchange Auth0 token or load user', error);
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ??
          'Échec de la connexion Auth0.'
        : 'Échec de la connexion Auth0.';
      setAuthError(message);
      const fallback = await restoreSessionWithRefresh();
      if (fallback) {
        setUser(fallback);
        setAuthError(null);
      } else {
        clearLocalAuth();
      }
    } finally {
      setIsBackendLoading(false);
      setIsAuthReady(true);
    }
  }, [getAccessTokenSilently, getIdTokenClaims, setUser, clearLocalAuth]);

  useEffect(() => {
    if (isFrontendOnlyAdmin) {
      setUser(fakeAdminUser);
      setIsBackendLoading(false);
      setIsAuthReady(true);
      return;
    }

    const runBackendHydration = () => {
      if (hydrationRef.current === 'backend' || hydrationRef.current === 'done') {
        return;
      }
      hydrationRef.current = 'backend';
      void hydrateFromBackendToken().finally(() => {
        if (hydrationRef.current === 'backend') {
          hydrationRef.current = 'done';
        }
      });
    };

    const runAuth0Exchange = () => {
      if (hydrationRef.current === 'auth0' || hydrationRef.current === 'done') {
        return;
      }
      hydrationRef.current = 'auth0';
      void fetchBackendUser().finally(() => {
        if (hydrationRef.current === 'auth0') {
          hydrationRef.current = 'done';
        }
      });
    };

    if (isAuth0Loading) {
      if (!hasPersistedAccessToken()) {
        setIsBackendLoading(false);
        setIsAuthReady(true);
      }
      // Wait for Auth0 SDK before backend hydrate/exchange to avoid duplicate /me + exchange.
      return;
    }

    if (hydrationRef.current === 'done') {
      return;
    }

    if (isAuth0Authenticated) {
      runAuth0Exchange();
      return;
    }

    if (hasPersistedAccessToken()) {
      runBackendHydration();
      return;
    }

    setIsBackendLoading(false);
    setIsAuthReady(true);
  }, [
    isAuth0Authenticated,
    isAuth0Loading,
    fetchBackendUser,
    hydrateFromBackendToken,
    setUser,
  ]);

  useEffect(() => {
    const onSessionExpired = () => {
      clearLocalAuth();
      window.location.replace(`${window.location.origin}/login`);
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [clearLocalAuth]);

  const login = useCallback(
    (returnTo?: string) => {
      setAuthError(null);
      const destination =
        returnTo && returnTo !== '/login' && returnTo !== '/callback'
          ? returnTo
          : '/';
      loginWithRedirect({
        appState: { returnTo: destination },
      });
    },
    [loginWithRedirect],
  );

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const legacyLogin = (token: string, userData: User, refreshToken?: string) => {
    clearRoleScopedStorage();
    clearPersistedAuthTokens();
    localStorage.setItem('access_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    setUser(userData);
    hydrationRef.current = 'done';
    setIsAuthReady(true);
    setIsBackendLoading(false);
    setAuthError(null);
  };

  const logout = useCallback(async () => {
    const loginUrl = `${window.location.origin}/login`;

    if (isFrontendOnlyAdmin) {
      clearLocalAuth();
      window.location.replace(loginUrl);
      return;
    }

    const hadLocalToken = Boolean(localStorage.getItem('access_token'));

    if (hadLocalToken) {
      try {
        await authApi.logout();
      } catch {
        // proceed with local + Auth0 logout
      }
    }

    clearLocalAuth();

    if (auth0Configured && isAuth0Authenticated) {
      auth0Logout({ logoutParams: { returnTo: loginUrl } });
      return;
    }

    window.location.replace(loginUrl);
  }, [isAuth0Authenticated, auth0Logout, clearLocalAuth, auth0Configured]);

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const hasToken = hasPersistedAccessToken();
  const isLoading =
    !isFrontendOnlyAdmin &&
    !isAuthReady &&
    (isAuth0Loading || isBackendLoading || hasToken);

  const isAuthenticated =
    isFrontendOnlyAdmin || isAuth0Authenticated || !!user;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: auth0Configured ? isAuthenticated : !!user,
        isLoading,
        isAuthReady,
        authError,
        user,
        login,
        legacyLogin,
        logout,
        updateUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
