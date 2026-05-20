import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { dispatchAuthSessionExpired } from '../../features/auth/utils/authSessionEvents';
import {
  clearPersistedAuthTokens,
  refreshAccessToken,
} from '../../features/auth/utils/authTokenRefresh';
import { writeCachedAuthUser } from '../../features/auth/utils/authSessionCache';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

function queueRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().then((session) => {
      refreshPromise = null;
      return session?.access ?? null;
    });
  }
  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (!original || status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (original.url?.includes('/auth/refresh') || original.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    original._retry = true;

    const newAccess = await queueRefresh();
    if (!newAccess) {
      clearPersistedAuthTokens();
      writeCachedAuthUser(null);
      dispatchAuthSessionExpired();
      return Promise.reject(error);
    }

    if (original.headers) {
      original.headers.Authorization = `Bearer ${newAccess}`;
    }
    return apiClient(original);
  },
);

export default apiClient;
