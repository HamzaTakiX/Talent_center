import { FunctionComponent, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/auth-form.css';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  isTextArea?: boolean;
  Icon?: LucideIcon;
  boxClassName?: string;
}

export const FormInput: FunctionComponent<FormInputProps> = ({
  label,
  error,
  isTextArea = false,
  Icon,
  boxClassName = '',
  type,
  ...inputProps
}) => {
  const { t } = useTranslation();
  const isPassword = !isTextArea && type === 'password';
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType = isPassword ? (passwordVisible ? 'text' : 'password') : type;

  return (
    <div
      className={`auth-form-field group flex w-full flex-col gap-1.5 transition-transform duration-300 ease-out focus-within:-translate-y-px ${error ? 'auth-form-field--error' : ''}`}
    >
      <div className="flex items-center justify-between">
        <label className="auth-form-field__label text-[13px] font-medium leading-none">{label}</label>
        {error ? <div className="auth-form-field__hint text-[11px] font-medium animate-pulse">{error}</div> : null}
      </div>
      <div
        className={`auth-form-field__box relative w-full overflow-hidden rounded-xl box-border ${isTextArea ? `flex items-start py-2.5 px-3.5 ${boxClassName}` : `flex h-11 items-center px-3.5 ${isPassword ? 'pe-10' : ''} ${boxClassName}`}`}
      >
        {Icon && isTextArea ? (
          <div className="flex w-full items-start gap-2.5">
            <Icon className="auth-form-field__icon mt-1 h-4 w-4 shrink-0" strokeWidth={2} />
            <textarea
              className="auth-form-input min-h-0 flex-1 resize-none text-[14px] leading-5 font-inter"
              rows={3}
              {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          </div>
        ) : null}
        {Icon && !isTextArea ? (
          <Icon className="auth-form-field__icon me-2.5 h-4 w-4 shrink-0" strokeWidth={2} />
        ) : null}
        {!Icon && isTextArea ? (
          <textarea
            className="auth-form-input min-h-0 w-full resize-none text-[14px] leading-5 font-inter"
            rows={3}
            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : null}
        {!isTextArea ? (
          <input
            className={`auth-form-input flex-1 text-[14px] font-inter ${inputType === 'url' || inputType === 'email' ? 'auth-ltr-field' : ''}`}
            dir={inputType === 'url' || inputType === 'email' ? 'ltr' : undefined}
            type={inputType}
            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        ) : null}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setPasswordVisible((v) => !v)}
            className="auth-password-toggle absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--auth-text-subtle)] transition-colors hover:bg-[var(--auth-brand-muted)] hover:text-[var(--auth-brand)]"
            aria-label={passwordVisible ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
          >
            {passwordVisible ? (
              <EyeOff className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
