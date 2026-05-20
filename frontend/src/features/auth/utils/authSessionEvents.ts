export const AUTH_SESSION_EXPIRED_EVENT = 'tc:auth-session-expired';

export function dispatchAuthSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}
