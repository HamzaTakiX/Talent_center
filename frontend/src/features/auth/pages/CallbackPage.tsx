import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthInitLoader } from '../components/AuthInitLoader';
import { useAuth } from '../hooks/useAuth';
import { getDefaultHomePath, normalizeRole } from '../utils/roleAuth';

export const CallbackPage = () => {
  const { error, isLoading: isAuth0Loading } = useAuth0();
  const { user, isAuthReady, authError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      console.error('Auth0 callback error:', error);
      navigate('/login', { replace: true });
      return;
    }

    if (!isAuth0Loading && isAuthReady) {
      if (user) {
        navigate(getDefaultHomePath(normalizeRole(user.role)), { replace: true });
      } else {
        navigate('/login', { replace: true, state: { authError } });
      }
    }
  }, [error, isAuth0Loading, isAuthReady, user, authError, navigate]);

  return (
    <AuthInitLoader
      message={t('auth.callback.title', { defaultValue: 'Connexion en cours…' })}
    />
  );
};

export default CallbackPage;
