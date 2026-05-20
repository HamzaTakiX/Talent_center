import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

export const AuthFooter: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="auth-section-divider auth-text-muted mb-2 mt-6 flex w-full justify-center border-t pt-4 text-[13px]">
      <div>
        <span>{t('auth.login.footerNeedHelp')} </span>
        <span className="cursor-pointer font-medium text-[var(--auth-brand)] hover:underline">support@esca.ma</span>
      </div>
    </div>
  );
};


