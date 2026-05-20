import axios from 'axios';
import type { User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface RefreshPayload {
  access: string;
  refresh: string;
  user: User;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/** Refresh JWT using a bare client (avoids axios interceptor loops). */
export async function refreshAccessToken(): Promise<RefreshPayload | null> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;

  try {
    const response = await axios.post<ApiEnvelope<RefreshPayload>>(
      `${API_BASE}/auth/refresh`,
      { refresh },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const data = response.data?.data;
    if (!data?.access) return null;

    localStorage.setItem('access_token', data.access);
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    return data;
  } catch {
    return null;
  }
}

export function clearPersistedAuthTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
