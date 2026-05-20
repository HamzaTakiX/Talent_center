import { FunctionComponent } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthTheme } from '../context/AuthThemeContext';

const AuthThemeToggle: FunctionComponent = () => {
  const { theme, toggleTheme } = useAuthTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="auth-pref-btn inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 transition-colors"
      aria-label={theme === 'light' ? t('auth.preferences.darkMode') : t('auth.preferences.lightMode')}
    >
      {theme === 'light' ? (
        <Moon className="h-[15px] w-[15px]" strokeWidth={2} />
      ) : (
        <Sun className="h-[15px] w-[15px]" strokeWidth={2} />
      )}
    </button>
  );
};

export default AuthThemeToggle;
