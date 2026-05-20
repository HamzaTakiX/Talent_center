import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import escaLogoLight from '../assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../assets/images/common/logo-esca.png';
import { useAuthTheme } from '../context/AuthThemeContext';
import AuthPreferencesBar from './AuthPreferencesBar';

type AuthInitLoaderProps = {
  message?: string;
  showPreferences?: boolean;
};

/** Branded full-screen loader while Auth0 / session hydrates. */
export const AuthInitLoader = ({
  message,
  showPreferences = true,
}: AuthInitLoaderProps) => {
  const { t } = useTranslation();
  const { theme } = useAuthTheme();
  const logo = theme === 'dark' ? escaLogoDark : escaLogoLight;
  const label = message ?? t('auth.loading.session', { defaultValue: 'Vérification de la session…' });

  return (
    <div
      className="auth-init-loader relative flex min-h-screen w-full flex-col items-center justify-center bg-[var(--auth-bg)] px-6 transition-colors duration-300"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {showPreferences && <AuthPreferencesBar placement="page" />}
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <motion.img
          src={logo}
          alt="ESCA"
          className="mb-6 h-12 w-auto object-contain lg:h-14"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="relative mb-5 flex h-14 w-14 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border-2 border-[var(--auth-border)] opacity-60"
            aria-hidden
          />
          <span
            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[var(--auth-brand)]"
            aria-hidden
          />
          <span
            className="h-2 w-2 rounded-full bg-[var(--auth-brand)] shadow-[0_0_12px_var(--auth-brand)]"
            aria-hidden
          />
        </div>
        <p className="auth-text-heading text-base font-semibold tracking-tight">{label}</p>
        <p className="auth-text-muted mt-2 max-w-xs text-sm">
          {t('auth.brand.tagline')}
        </p>
      </motion.div>
    </div>
  );
};
