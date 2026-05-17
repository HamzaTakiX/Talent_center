import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

export const AuthFooter: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-2 mt-6 flex w-full justify-center border-t border-solid border-gainsboro pt-4 text-[13px] text-dimgray">
      <div>
        <span>{t('auth.login.footerNeedHelp')} </span>
        <span className="cursor-pointer font-medium text-mediumslateblue hover:underline">support@esca.ma</span>
      </div>
    </div>
  );
};


