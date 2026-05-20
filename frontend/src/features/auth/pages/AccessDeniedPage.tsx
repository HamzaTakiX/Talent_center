import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { AuthScreenShell } from '../components/AuthScreenShell';
import AuthPreferencesBar from '../components/AuthPreferencesBar';
import { useAuth } from '../hooks/useAuth';
import { getDefaultHomePath, normalizeRole } from '../utils/roleAuth';

export const AccessDeniedPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const home = user ? getDefaultHomePath(normalizeRole(user.role)) : '/login';

  return (
    <AuthScreenShell>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 pt-14">
        <AuthPreferencesBar placement="page" />
        <div className="auth-form-field__box max-w-md rounded-2xl p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-[var(--auth-brand)]" aria-hidden />
          <h2 className="auth-text-heading text-xl font-semibold">
            {t('auth.accessDenied.title', { defaultValue: 'Accès non autorisé' })}
          </h2>
          <p className="auth-text-muted mt-2 text-sm">
            {t('auth.accessDenied.body', {
              defaultValue: 'Votre rôle ne permet pas d’accéder à cette section.',
            })}
          </p>
          <button
            type="button"
            className="auth-btn-primary mt-6 h-11 w-full rounded-xl text-sm font-semibold"
            onClick={() => navigate(home, { replace: true })}
          >
            {t('auth.accessDenied.back', { defaultValue: 'Retour à mon espace' })}
          </button>
        </div>
      </div>
    </AuthScreenShell>
  );
};

export default AccessDeniedPage;
