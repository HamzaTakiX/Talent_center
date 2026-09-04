import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { AuthScreenShell } from '../components/AuthScreenShell';
import AuthPreferencesBar from '../components/AuthPreferencesBar';
import { useAuth } from '../hooks/useAuth';
import { getDefaultHomePath, normalizeRole } from '../utils/roleAuth';

type AccessDeniedState = {
  reason?: 'sso' | 'role';
  message?: string;
} | null;

export const AccessDeniedPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, clearAuthError } = useAuth();
  const state = (location.state as AccessDeniedState) ?? null;
  const isSsoDenial = state?.reason === 'sso' || (!user && Boolean(state?.message));

  const title = isSsoDenial
    ? t('auth.accessDenied.ssoTitle')
    : t('auth.accessDenied.title');
  const body = isSsoDenial
    ? (state?.message || t('auth.accessDenied.ssoBody'))
    : t('auth.accessDenied.body');
  const hint = isSsoDenial ? t('auth.accessDenied.ssoHint') : null;

  const home = user ? getDefaultHomePath(normalizeRole(user.role)) : '/login';

  return (
    <AuthScreenShell>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 pt-14">
        <AuthPreferencesBar placement="page" />
        <div className="auth-form-field__box max-w-md rounded-2xl p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-[var(--auth-brand)]" aria-hidden />
          <h2 className="auth-text-heading text-xl font-semibold">{title}</h2>
          <p className="auth-text-muted mt-2 text-sm leading-relaxed">{body}</p>
          {hint ? (
            <p className="auth-text-muted mt-2 text-sm leading-relaxed">{hint}</p>
          ) : null}

          <div className="mt-6 flex w-full flex-col gap-3">
            <button
              type="button"
              className="auth-btn-primary h-11 w-full rounded-xl text-sm font-semibold"
              onClick={() => {
                clearAuthError();
                navigate('/login', { replace: true });
              }}
            >
              {t('auth.accessDenied.backToLogin')}
            </button>

            {isSsoDenial ? (
              <button
                type="button"
                className="auth-btn-secondary h-11 w-full rounded-xl text-sm font-medium"
                onClick={() => {
                  clearAuthError();
                  login('/', { selectAccount: true });
                }}
              >
                {t('auth.accessDenied.tryAnotherMicrosoft')}
              </button>
            ) : (
              <button
                type="button"
                className="auth-btn-secondary h-11 w-full rounded-xl text-sm font-medium"
                onClick={() => navigate(home, { replace: true })}
              >
                {t('auth.accessDenied.back')}
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthScreenShell>
  );
};

export default AccessDeniedPage;
