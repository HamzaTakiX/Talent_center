import { useTranslation } from 'react-i18next';
import { AuthScreenShell } from './AuthScreenShell';
import AuthPreferencesBar from './AuthPreferencesBar';

/** Shown when VITE_AUTH0_* are missing (common on Vercel without env vars). */
export const AuthConfigErrorScreen = () => {
  const { t } = useTranslation();
  const isProd = import.meta.env.PROD;

  return (
    <AuthScreenShell>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 pt-14">
        <AuthPreferencesBar placement="page" />
        <div className="auth-form-field__box max-w-lg rounded-2xl p-8 text-center shadow-sm">
          <h2 className="auth-text-heading text-xl font-semibold">
            {t('auth.configMissing.title', { defaultValue: 'Configuration Auth0 manquante' })}
          </h2>
          <p className="auth-text-muted mt-3 text-sm leading-relaxed">
            {t('auth.configMissing.body', {
              defaultValue:
                'Ajoutez VITE_AUTH0_DOMAIN et VITE_AUTH0_CLIENT_ID dans .env.local (développement) ou dans le tableau de bord Vercel (production), puis redéployez.',
            })}
          </p>
          {isProd && (
            <ul className="auth-text-muted mt-4 list-inside list-disc text-left text-sm">
              <li>
                <code className="text-xs">VITE_AUTH0_DOMAIN</code> — domaine du tenant Auth0
              </li>
              <li>
                <code className="text-xs">VITE_AUTH0_CLIENT_ID</code> — ID client SPA (public)
              </li>
              <li>
                <code className="text-xs">VITE_API_URL</code> — URL de l&apos;API backend
              </li>
            </ul>
          )}
          <p className="auth-text-subtle mt-4 text-xs">
            {t('auth.configMissing.secretHint', {
              defaultValue: 'Ne jamais exposer AUTH0_CLIENT_SECRET côté frontend.',
            })}
          </p>
        </div>
      </div>
    </AuthScreenShell>
  );
};
