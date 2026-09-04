import { FunctionComponent, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import microsoftIcon from '../assets/icons/login/microsoft.svg';
import loginCover from '../assets/images/login/DSCF1339 (1).webp';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api';
import { getLoginErrorMessage, isMicrosoftAccessDeniedMessage } from '../utils/loginErrors';
import { validateEmail } from '../utils/validation';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import { FormInput } from '../components/FormInput';
import AuthImagePanel from '../components/AuthImagePanel';
import { AuthScreenShell, AuthFormColumn } from '../components/AuthScreenShell';
import '../styles/auth-form.css';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const LoginPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { login, legacyLogin, authError, clearAuthError } = useAuth();
  const returnTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    '/';
  const stateAuthError =
    (location.state as { authError?: string } | null)?.authError ?? null;
  const displayAuthError = authError || stateAuthError;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Frontend validation - only basic checks
    if (!email.trim()) {
      setError(t('auth.login.errors.emailRequired'));
      return;
    }
    if (!validateEmail(email)) {
      setError(t('auth.login.errors.emailInvalid'));
      return;
    }
    if (!password) {
      setError(t('auth.login.errors.passwordRequired'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await authApi.login(email, password);
      if (response.access && legacyLogin) {
        legacyLogin(response.access, response.user, response.refresh);
      }
    } catch (err: any) {
      setError(getLoginErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell>
      <AuthFormColumn>
        <motion.div
          className="w-full flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AuthHeader />
          </motion.div>

          <AnimatePresence>
            {displayAuthError && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full mb-4 overflow-hidden"
              >
                <div className="auth-alert-error flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {isMicrosoftAccessDeniedMessage(displayAuthError, t) ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">
                        {t('auth.login.errors.microsoftAccessDeniedTitle')}
                      </span>
                      <span className="font-normal leading-snug">{displayAuthError}</span>
                      <span className="font-normal text-xs leading-snug opacity-90">
                        {t('auth.login.errors.microsoftAccessDeniedHint')}
                      </span>
                    </div>
                  ) : (
                    <span>{displayAuthError}</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message Animation */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full mb-4 overflow-hidden"
              >
                <div className="auth-alert-error flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              clearAuthError();
              login(returnTo);
            }}
            className="auth-btn-secondary mb-4 mt-2 box-border flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl shadow-sm transition-all duration-300"
          >
            <img className="h-5 w-5 shrink-0" alt="Microsoft" src={microsoftIcon} />
            <div className="text-[14px] font-medium leading-5">{t('auth.login.microsoft')}</div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-4 flex w-full items-center">
            <div className="auth-divider h-px flex-1" />
            <div className="auth-section-heading px-3 text-[10px] tracking-widest">{t('auth.login.or')}</div>
            <div className="auth-divider h-px flex-1" />
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-4">
            <FormInput 
              label={t('auth.login.emailLabel')}
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              Icon={Mail}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder={t('auth.login.emailPlaceholder')}
            />
            <FormInput 
              label={t('auth.login.passwordLabel')}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              Icon={Lock}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.login.passwordPlaceholder')}
            />
            <div className="mt-[-10px] flex w-full justify-end">
              <span className="cursor-pointer text-xs font-medium text-[var(--auth-brand)] transition-all hover:underline">
                {t('auth.login.forgotPassword')}
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={handleLogin}
              className={`auth-btn-primary relative mt-1 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl border-none shadow-md outline-none transition-all duration-300 ${loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <div className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <LogIn className="w-[18px] h-[18px] opacity-90" strokeWidth={2.5}/>
                )}
                <span className="font-semibold text-[15px]">{loading ? t('auth.login.submitting') : t('auth.login.submitButton')}</span>
              </div>
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AuthFooter />
          </motion.div>
        </motion.div>
      </AuthFormColumn>

      <AuthImagePanel
        imageSrc={loginCover}
        imageAlt={t('auth.login.panelCoverAlt')}
        badge={t('auth.login.panelBadge')}
        title={t('auth.login.panelTitle')}
        subtitle={t('auth.login.panelSubtitle')}
      />

    </AuthScreenShell>
  );
};
export default LoginPage;
