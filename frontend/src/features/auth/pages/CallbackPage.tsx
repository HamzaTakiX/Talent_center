import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthInitLoader } from '../components/AuthInitLoader';
import { useAuth } from '../hooks/useAuth';
import { getAuth0CallbackErrorMessage, isMicrosoftAccessDeniedMessage } from '../utils/loginErrors';
import { getDefaultHomePath, normalizeRole } from '../utils/roleAuth';

export const CallbackPage = () => {
  const { error, isLoading: isAuth0Loading } = useAuth0();
  const { user, isAuthReady, authError, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      console.error('Auth0 callback error:', error);
      const message = getAuth0CallbackErrorMessage(error, t);
      if (message && isMicrosoftAccessDeniedMessage(message, t)) {
        navigate('/unauthorized', {
          replace: true,
          state: { reason: 'sso', message },
        });
        return;
      }
      navigate('/login', {
        replace: true,
        ...(message ? { state: { authError: message } } : {}),
      });
      return;
    }

    if (!isAuth0Loading && isAuthReady && !isLoading) {
      if (user) {
        navigate(getDefaultHomePath(normalizeRole(user.role)), { replace: true });
        return;
      }

      if (authError && isMicrosoftAccessDeniedMessage(authError, t)) {
        navigate('/unauthorized', {
          replace: true,
          state: { reason: 'sso', message: authError },
        });
        return;
      }

      navigate('/login', {
        replace: true,
        ...(authError ? { state: { authError } } : {}),
      });
    }
  }, [error, isAuth0Loading, isAuthReady, isLoading, user, authError, navigate, t]);

  return (
    <AuthInitLoader
      message={t('auth.callback.title', { defaultValue: 'Connexion en cours…' })}
    />
  );
};

export default CallbackPage;
