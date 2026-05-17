import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import logoImage from '../assets/images/common/Logo_ESCA.png';

export const AuthHeader: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 mt-5 flex w-full flex-col items-start gap-1.5 lg:mb-8 lg:mt-4">
      <div className="flex items-center gap-3">
        <img className="h-10 w-auto shrink-0 object-contain lg:h-12" alt="ESCA Logo" src={logoImage} />
        <div className="text-[21px] font-semibold leading-8 tracking-tight text-gray lg:text-[24px]">
          {t('auth.brand.title')}
        </div>
      </div>
      <p className="text-[13px] font-medium leading-6 text-dimgray lg:text-[15px]">{t('auth.brand.tagline')}</p>
    </div>
  );
};

