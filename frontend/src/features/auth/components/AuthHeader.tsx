import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import escaLogoLight from '../assets/images/common/Logo_ESCA.png';
import escaLogoDark from '../assets/images/common/logo-esca.png';
import { useAuthTheme } from '../context/AuthThemeContext';

export const AuthHeader: FunctionComponent = () => {
  const { t } = useTranslation();
  const { theme } = useAuthTheme();
  const logoImage = theme === 'dark' ? escaLogoDark : escaLogoLight;

  return (
    <div className="mb-6 mt-5 flex w-full flex-col items-start gap-1.5 lg:mb-8 lg:mt-4">
      <div className="flex items-center gap-3">
        <img className="h-10 w-auto shrink-0 object-contain lg:h-12" alt="ESCA Logo" src={logoImage} />
        <div className="auth-text-heading text-[21px] font-semibold leading-8 tracking-tight lg:text-[24px]">
          {t('auth.brand.title')}
        </div>
      </div>
      <p className="auth-text-muted text-[13px] font-medium leading-6 lg:text-[15px]">{t('auth.brand.tagline')}</p>
    </div>
  );
};

