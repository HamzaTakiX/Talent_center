import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: () => void;
  legacyLogin: (token: string, userData: User, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Check if frontend-only admin mode is enabled
const isFrontendOnlyAdmin = import.meta.env.VITE_FRONTEND_ONLY_ADMIN === 'true';

// Fake admin user for frontend-only mode
const fakeAdminUser: User = {
  id: 999,
  email: 'admin.demo@talentcenter.local',
  role: 'ADMIN',
  full_name: 'Super Admin',
  account_status: 'ACTIVE',
  profile: {
    id: 1,
    first_name: 'Super',
    last_name: 'Admin',
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    isAuthenticated: isAuth0Authenticated, 
    isLoading: isAuth0Loading, 
    loginWithRedirect, 
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();

  const [user, setUser] = useState<User | null>(null);
  const [isBackendLoading, setIsBackendLoading] = useState(true);

  const fetchBackendUser = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      // Store token so legacy authApi logic still works
      localStorage.setItem('access_token', token);

      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      console.error('Failed to get token or backend user', error);
      setUser(null);
      localStorage.removeItem('access_token');
    } finally {
      setIsBackendLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    // Frontend-only admin mode: Set fake user immediately
    if (isFrontendOnlyAdmin) {
      setUser(fakeAdminUser);
      setIsBackendLoading(false);
      return;
    }

    // Normal auth flow
    if (isAuth0Loading) return;

    if (isAuth0Authenticated) {
      fetchBackendUser();
    } else {
      // Fallback: Check if there is a legacy mock token in localStorage
      const initLegacyAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const userData = await authApi.me();
            setUser(userData);
          } catch (error) {
            localStorage.removeItem('access_token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsBackendLoading(false);
      };
      initLegacyAuth();
    }
  }, [isAuth0Authenticated, isAuth0Loading, fetchBackendUser]);

  const login = () => {
    loginWithRedirect();
  };

  const legacyLogin = (token: string, userData: User, refreshToken?: string) => {
    localStorage.setItem('access_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    setUser(userData);
  };

  const clearLocalAuth = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    const loginUrl = `${window.location.origin}/login`;

    if (isFrontendOnlyAdmin) {
      clearLocalAuth();
      window.location.replace(loginUrl);
      return;
    }

    const hadLocalToken = Boolean(localStorage.getItem('access_token'));

    // Revoke backend session while the access token is still valid.
    if (hadLocalToken) {
      await authApi.logout();
    }

    clearLocalAuth();

    if (isAuth0Authenticated) {
      auth0Logout({ logoutParams: { returnTo: loginUrl } });
      return;
    }

    window.location.replace(loginUrl);
  }, [isAuth0Authenticated, auth0Logout, clearLocalAuth]);

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  // The application is loading if Auth0 is loading or we are fetching the backend user
  const isLoading = isAuth0Loading || isBackendLoading;
  
  // We are fully authenticated if Auth0 is authenticated, OR if we successfully fetched a backend user (legacy fallback)
  const isAuthenticated = isAuth0Authenticated || !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, legacyLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
