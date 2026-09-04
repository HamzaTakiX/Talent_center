import { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { isAxiosError } from 'axios';
import { User } from '../types';
import { authApi } from '../api';
import { getAuth0Connection, getAuth0EnvConfig } from '../config/auth0Env';
import { getAppOrigin } from '../config/appEnv';
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
import { getLoginErrorMessage, getMicrosoftAccessDeniedMessage } from '../utils/loginErrors';
import i18n from '../../../i18n/config';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once JWT/session resolution finished (success or hard failure). */
  isAuthReady: boolean;
  /** True when auth bootstrap finished and API calls may use a valid token. */
  isSessionReady: boolean;
  authError: string | null;
  user: User | null;
  login: (returnTo?: string, options?: { selectAccount?: boolean }) => void;
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

/** Prevent a stale in-flight /auth/me from rolling back onboarding progress. */
function mergeAuthUserProgress(prev: User | null, next: User): User {
  const prevSp = prev?.student_profile;
  const nextSp = next.student_profile;
  if (!prevSp || !nextSp) return next;
  return {
    ...next,
    student_profile: {
      ...nextSp,
      identity_confirmed: prevSp.identity_confirmed || nextSp.identity_confirmed,
      profile_completed: prevSp.profile_completed || nextSp.profile_completed,
    },
  };
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
    setUserState((prev) => {
      if (!next) {
        writeCachedAuthUser(null);
        return null;
      }
      const merged = mergeAuthUserProgress(prev, next);
      writeCachedAuthUser(merged);
      return merged;
    });
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
        ? getLoginErrorMessage(error, i18n.t.bind(i18n), { source: 'sso' })
        : getMicrosoftAccessDeniedMessage(i18n.t.bind(i18n));
      setAuthError(message);
      const fallback = await restoreSessionWithRefresh();
      if (fallback) {
        setUser(fallback);
        setAuthError(null);
      } else {
        clearLocalAuth();
        if (isAuth0Authenticated) {
          try {
            await auth0Logout({ openUrl: false });
          } catch {
            // proceed — local session already cleared
          }
        }
      }
    } finally {
      setIsBackendLoading(false);
      setIsAuthReady(true);
    }
  }, [getAccessTokenSilently, getIdTokenClaims, setUser, clearLocalAuth, isAuth0Authenticated, auth0Logout]);

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
      window.location.replace(`${getAppOrigin()}/login`);
    };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [clearLocalAuth]);

  const login = useCallback(
    (returnTo?: string, _options?: { selectAccount?: boolean }) => {
      setAuthError(null);
      const connection = getAuth0Connection();
      if (!connection) {
        setAuthError(i18n.t('auth.login.errors.microsoftConnectionMissingMessage'));
        return;
      }
      const destination =
        returnTo && returnTo !== '/login' && returnTo !== '/callback'
          ? returnTo
          : '/';
      loginWithRedirect({
        appState: { returnTo: destination },
        authorizationParams: {
          connection,
          // Always show Microsoft account picker on explicit SSO click.
          prompt: 'select_account',
        },
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
    // Auth0 Allowed Logout URLs must include this exact returnTo.
    // Use app origin (not /login) so it matches the usual dashboard entry:
    //   Allowed Logout URLs = {VITE_APP_URL}
    const appOrigin = getAppOrigin();
    const loginUrl = `${appOrigin}/login`;

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
      auth0Logout({ logoutParams: { returnTo: appOrigin } });
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

  const isSessionReady =
    isFrontendOnlyAdmin || (isAuthReady && !isBackendLoading);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: auth0Configured ? isAuthenticated : !!user,
        isLoading,
        isAuthReady,
        isSessionReady,
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
