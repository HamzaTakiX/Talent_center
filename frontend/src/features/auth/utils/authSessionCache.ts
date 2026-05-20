import type { User } from '../types';

const USER_CACHE_KEY = 'tc_auth_user';

function readFromStorage(storage: Storage): User | null {
  try {
    const raw = storage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function readCachedAuthUser(): User | null {
  return readFromStorage(localStorage) ?? readFromStorage(sessionStorage);
}

export function writeCachedAuthUser(user: User | null): void {
  try {
    if (user) {
      const payload = JSON.stringify(user);
      localStorage.setItem(USER_CACHE_KEY, payload);
      sessionStorage.setItem(USER_CACHE_KEY, payload);
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
      sessionStorage.removeItem(USER_CACHE_KEY);
    }
  } catch {
    // ignore quota / private mode errors
  }
}

export function hasPersistedAccessToken(): boolean {
  return Boolean(localStorage.getItem('access_token'));
}

/** True when we can render the app shell immediately while auth refreshes in the background. */
export function canRestoreSessionFromCache(): boolean {
  return hasPersistedAccessToken() && readCachedAuthUser() != null;
}
