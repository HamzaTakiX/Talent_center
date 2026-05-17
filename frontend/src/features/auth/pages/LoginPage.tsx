import { FunctionComponent, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import microsoftIcon from '../assets/icons/login/microsoft.svg';
import loginCover from '../assets/images/login/DSCF1339 (1).webp';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api';
import { validateEmail } from '../utils/validation';
import { AuthHeader } from '../components/AuthHeader';
import { AuthFooter } from '../components/AuthFooter';
import { FormInput } from '../components/FormInput';
import AuthImagePanel from '../components/AuthImagePanel';
import AuthLanguageSwitcher from '../components/AuthLanguageSwitcher';

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
  const { login, legacyLogin } = useAuth(); // login = Auth0, legacyLogin = custom form mock
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err: any): string => {
    if (!err.response) {
      return t('auth.login.errors.connectionMessage');
    }

    const status = err.response.status;
    const data = err.response.data;
    const backendMessage = data?.message || data?.detail || '';

    switch (status) {
      case 400:
        if (data?.errors) {
          const fieldErrors = Object.entries(data.errors)
            .map(([, msgs]) => `${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          return fieldErrors || t('auth.login.errors.validationMessage');
        }
        return backendMessage || t('auth.login.errors.validationMessage');

      case 401:
        return t('auth.login.errors.authMessage');

      case 403:
        if (backendMessage.toLowerCase().includes('suspended')) {
          return t('auth.login.errors.suspendedMessage');
        }
        if (backendMessage.toLowerCase().includes('pending')) {
          return t('auth.login.errors.pendingMessage');
        }
        return backendMessage || t('auth.login.errors.deniedMessage');

      case 423:
        return t('auth.login.errors.lockedMessage');

      case 429:
        return t('auth.login.errors.rateLimitMessage');

      case 500:
      case 502:
      case 503:
      case 504:
        return t('auth.login.errors.serverMessage');

      default:
        return backendMessage || t('auth.login.errors.failedMessage');
    }
  };

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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-white text-start font-inter text-sm text-darkslategray">
      {/* Form Container */}
      <div className="relative w-full flex-1 lg:w-1/2 lg:h-full overflow-y-auto flex flex-col items-center px-5 sm:px-8 pb-12 lg:p-4 box-border">
        <div className="absolute end-5 top-5 z-20 sm:end-8 sm:top-6">
          <AuthLanguageSwitcher embedded />
        </div>
        <motion.div 
          className="w-full max-w-[500px] flex flex-col relative m-auto py-6 lg:py-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AuthHeader />
          </motion.div>

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
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} 
            whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={login}
            className="w-full rounded-xl bg-white border-lightgray border-solid border-[1px] box-border h-12 flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-all duration-300 mb-4 mt-2 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-slate-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
            <img className="w-5 h-5 relative z-10" alt="Microsoft" src={microsoftIcon} />
            <div className="leading-5 font-medium text-[14px] relative z-10">{t('auth.login.microsoft')}</div>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex items-center mb-4 text-slategray-200">
            <div className="flex-1 bg-gainsboro h-[1px]" />
            <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slategray-100">{t('auth.login.or')}</div>
            <div className="flex-1 bg-gainsboro h-[1px]" />
          </motion.div>

          <motion.div variants={itemVariants} className="w-full flex flex-col gap-4">
            <FormInput 
              label={t('auth.login.emailLabel')}
              type="email"
              value={email}
              Icon={Mail}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder={t('auth.login.emailPlaceholder')}
            />
            <FormInput 
              label={t('auth.login.passwordLabel')}
              type="password"
              value={password}
              Icon={Lock}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.login.passwordPlaceholder')}
            />
            <div className="w-full flex justify-end mt-[-10px] text-mediumslateblue">
              <span className="text-xs font-medium cursor-pointer hover:underline transition-all">{t('auth.login.forgotPassword')}</span>
            </div>
            
            <motion.button 
              whileHover={{ y: -1, boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading} 
              onClick={handleLogin} 
              className={`w-full h-[48px] rounded-xl bg-mediumslateblue outline-none border-none text-white flex items-center justify-center mt-1 shadow-md active:opacity-90 relative overflow-hidden group ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-slateblue'} transition-all duration-300`}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12"></div>
              <div className="flex items-center gap-2 relative z-10">
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
      </div>

      <AuthImagePanel
        imageSrc={loginCover}
        imageAlt={t('auth.login.panelCoverAlt')}
        badge={t('auth.login.panelBadge')}
        title={t('auth.login.panelTitle')}
        subtitle={t('auth.login.panelSubtitle')}
      />

    </div>
  );
};
export default LoginPage;
