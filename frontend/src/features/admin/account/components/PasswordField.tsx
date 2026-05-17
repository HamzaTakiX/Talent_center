import { FunctionComponent, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

const PasswordField: FunctionComponent<PasswordFieldProps> = ({
  label,
  error,
  hint,
  id,
  className = '',
  containerClassName = '',
  ...inputProps
}) => {
  const [visible, setVisible] = useState(false);
  const fieldId = id ?? `pwd-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const hasError = error != null && error !== '';

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${containerClassName}`.trim()}>
      <label htmlFor={fieldId} className="text-sm font-medium text-[var(--admin-text)]">
        {label}
      </label>
      {hint != null && hint !== '' && (
        <p className="-mt-1 text-xs text-[var(--admin-text-secondary)]">{hint}</p>
      )}
      <div className="relative min-w-0 w-full">
        <input
          {...inputProps}
          id={fieldId}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          className={`admin-input box-border w-full max-w-full rounded-xl py-2.5 pe-11 ps-4 text-sm transition-[border-color,box-shadow] ${
            hasError ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''
          } ${className}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${fieldId}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-brand-muted)] hover:text-[var(--admin-brand)]"
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
      {hasError && (
        <p id={`${fieldId}-error`} className="text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
