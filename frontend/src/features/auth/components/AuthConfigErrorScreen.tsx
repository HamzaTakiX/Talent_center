import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Auth0EnvConfig } from '../config/auth0Env';
import { getAuth0MissingKeys } from '../config/auth0Env';
import { AuthScreenShell } from './AuthScreenShell';
import AuthPreferencesBar from './AuthPreferencesBar';

type AuthConfigErrorScreenProps = {
  diagnostics?: Auth0EnvConfig['diagnostics'];
};

function envStatus(
  fromMeta: boolean,
  fromRuntime: boolean,
): 'ok' | 'missing' {
  return fromMeta || fromRuntime ? 'ok' : 'missing';
}

/** Shown when VITE_AUTH0_* are missing at build time or runtime. */
export const AuthConfigErrorScreen = ({ diagnostics }: AuthConfigErrorScreenProps) => {
  const { t } = useTranslation();
  const isProd = import.meta.env.PROD;

  const missingKeys = useMemo(
    () => (diagnostics ? getAuth0MissingKeys(diagnostics) : ['VITE_AUTH0_DOMAIN', 'VITE_AUTH0_CLIENT_ID']),
    [diagnostics],
  );

  const domainStatus = diagnostics
    ? envStatus(diagnostics.domainFromMeta, diagnostics.domainFromRuntime)
    : 'missing';
  const clientIdStatus = diagnostics
    ? envStatus(diagnostics.clientIdFromMeta, diagnostics.clientIdFromRuntime)
    : 'missing';

  return (
    <AuthScreenShell>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 pt-14">
        <AuthPreferencesBar placement="page" />
        <div className="auth-form-field__box max-w-lg rounded-2xl p-8 text-center shadow-sm">
          <h2 className="auth-text-heading text-xl font-semibold">
            {t('auth.configMissing.title', { defaultValue: 'Configuration Auth0 manquante' })}
          </h2>

          {missingKeys.length === 1 && missingKeys[0] === 'VITE_AUTH0_CLIENT_ID' ? (
            <p className="auth-alert-error mt-4 rounded-xl px-4 py-3 text-sm font-medium">
              {t('auth.configMissing.clientIdOnly', {
                defaultValue:
                  'VITE_AUTH0_DOMAIN est détecté, mais VITE_AUTH0_CLIENT_ID est absent du build Vercel. Ajoutez-le dans Environment Variables, puis redéployez sans cache.',
              })}
            </p>
          ) : missingKeys.length === 1 && missingKeys[0] === 'VITE_AUTH0_DOMAIN' ? (
            <p className="auth-alert-error mt-4 rounded-xl px-4 py-3 text-sm font-medium">
              {t('auth.configMissing.domainOnly', {
                defaultValue:
                  'VITE_AUTH0_CLIENT_ID est détecté, mais VITE_AUTH0_DOMAIN est absent. Vérifiez le nom exact de la variable sur Vercel.',
              })}
            </p>
          ) : (
            <p className="auth-text-muted mt-3 text-sm leading-relaxed">
              {t('auth.configMissing.body', {
                defaultValue:
                  'Les variables VITE_AUTH0_* doivent être définies dans Vercel (Production + Preview), puis redéployez sans cache.',
              })}
            </p>
          )}

          <ul className="auth-text-muted mt-4 space-y-2 text-left text-sm">
            <li className="flex items-center justify-between gap-2">
              <code className="text-xs">VITE_AUTH0_DOMAIN</code>
              <span
                className={
                  domainStatus === 'ok'
                    ? 'text-xs font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'text-xs font-semibold text-red-600 dark:text-red-400'
                }
              >
                {domainStatus === 'ok'
                  ? t('auth.configMissing.detected', { defaultValue: 'Détecté' })
                  : t('auth.configMissing.missing', { defaultValue: 'Manquant' })}
              </span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <code className="text-xs">VITE_AUTH0_CLIENT_ID</code>
              <span
                className={
                  clientIdStatus === 'ok'
                    ? 'text-xs font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'text-xs font-semibold text-red-600 dark:text-red-400'
                }
              >
                {clientIdStatus === 'ok'
                  ? t('auth.configMissing.detected', { defaultValue: 'Détecté' })
                  : t('auth.configMissing.missing', { defaultValue: 'Manquant' })}
              </span>
            </li>
          </ul>

          {isProd && missingKeys.includes('VITE_AUTH0_CLIENT_ID') && (
            <div className="auth-text-muted mt-4 rounded-lg border border-[var(--auth-border)] bg-[var(--auth-input-bg)] p-3 text-left text-xs leading-relaxed">
              <p className="font-semibold text-[var(--auth-text)]">
                {t('auth.configMissing.vercelStepsTitle', { defaultValue: 'Sur Vercel' })}
              </p>
              <ol className="mt-2 list-decimal list-inside space-y-1">
                <li>
                  Settings → Environment Variables →{' '}
                  <strong>VITE_AUTH0_CLIENT_ID</strong>
                </li>
                <li>
                  Valeur :{' '}
                  <code className="text-[10px]">W5BBJeFW6fniUT5EsTc0z7B2csWl1mvO</code>
                </li>
                <li>Cocher Production + Preview</li>
                <li>Deployments → Redeploy → Clear build cache</li>
              </ol>
              <p className="mt-2 text-[var(--auth-text-subtle)]">
                {t('auth.configMissing.nameExact', {
                  defaultValue:
                    'Le nom doit être exact (préfixe VITE_, pas AUTH0_CLIENT_ID seul).',
                })}
              </p>
            </div>
          )}

          {isProd && diagnostics && (
            <pre className="auth-text-subtle mt-4 max-h-32 overflow-auto rounded-lg bg-[var(--auth-input-bg)] p-3 text-left text-[10px] leading-relaxed">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
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
