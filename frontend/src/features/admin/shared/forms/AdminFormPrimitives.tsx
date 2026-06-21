import {
  forwardRef,
  FunctionComponent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { Calendar, Upload, type LucideIcon } from 'lucide-react';
import {
  adminFormDateInputClass,
  adminFormDateWrapClass,
  adminFormFieldClass,
  adminFormFileClass,
  adminFormHintClass,
  adminFormInputClass,
  adminFormLabelClass,
  adminFormRequiredClass,
  adminFormTextareaClass,
} from './adminFormClasses';
import { ADMIN_FORM_FIELD_ICONS, type AdminFormFieldKey } from './adminFormIcons';

type IconInputProps = {
  leadingIcon?: LucideIcon;
  fieldKey?: AdminFormFieldKey;
};

const resolveLeadingIcon = (leadingIcon?: LucideIcon, fieldKey?: AdminFormFieldKey) =>
  leadingIcon ?? (fieldKey ? ADMIN_FORM_FIELD_ICONS[fieldKey] : undefined);

const InputIconWrap: FunctionComponent<{
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}> = ({ icon: Icon, children, className = '' }) => {
  if (!Icon) return <>{children}</>;
  return (
    <div className={`admin-form-input-wrap ${className}`.trim()}>
      <Icon className="admin-form-input-wrap__icon" strokeWidth={1.75} aria-hidden />
      {children}
    </div>
  );
};

export const AdminFormField: FunctionComponent<{
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  fieldKey?: AdminFormFieldKey;
  icon?: LucideIcon;
  children: ReactNode;
}> = ({ label, htmlFor, required, hint, error, className = '', fieldKey, icon, children }) => {
  const FieldIcon = icon ?? (fieldKey ? ADMIN_FORM_FIELD_ICONS[fieldKey] : undefined);
  return (
    <div
      className={`${adminFormFieldClass} ${error ? 'admin-form-field--error' : ''} ${className}`.trim()}
    >
      <label htmlFor={htmlFor} className={adminFormLabelClass}>
        {FieldIcon ? (
          <span className="admin-form-label-icon-wrap" aria-hidden>
            <FieldIcon className="admin-form-label-icon" strokeWidth={1.75} />
          </span>
        ) : null}
        <span>{label}</span>
        {required ? (
          <span className={adminFormRequiredClass} aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? <p className="admin-form-field-error">{error}</p> : null}
      {hint && !error ? <p className={adminFormHintClass}>{hint}</p> : null}
    </div>
  );
};

export const AdminFormInput: FunctionComponent<
  InputHTMLAttributes<HTMLInputElement> & IconInputProps
> = ({ className = '', leadingIcon, fieldKey, disabled, readOnly, ...props }) => {
  const Icon = resolveLeadingIcon(leadingIcon, fieldKey);
  const stateClass = [
    Icon ? 'admin-form-input--with-icon' : '',
    disabled ? 'admin-form-input--disabled' : '',
    readOnly ? 'admin-form-input--readonly' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const input = (
    <input
      {...props}
      disabled={disabled}
      readOnly={readOnly}
      className={`${adminFormInputClass} ${stateClass} ${className}`.trim()}
    />
  );

  return <InputIconWrap icon={Icon}>{input}</InputIconWrap>;
};

export const AdminFormTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & IconInputProps
>(({ className = '', leadingIcon, fieldKey, disabled, readOnly, ...props }, ref) => {
  const Icon = resolveLeadingIcon(leadingIcon, fieldKey);
  const stateClass = [
    Icon ? 'admin-form-textarea--with-icon' : '',
    disabled ? 'admin-form-input--disabled' : '',
    readOnly ? 'admin-form-input--readonly' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const textarea = (
    <textarea
      ref={ref}
      {...props}
      disabled={disabled}
      readOnly={readOnly}
      className={`${adminFormTextareaClass} ${stateClass} ${className}`.trim()}
    />
  );

  return (
    <InputIconWrap icon={Icon} className="admin-form-textarea-wrap">
      {textarea}
    </InputIconWrap>
  );
});

AdminFormTextarea.displayName = 'AdminFormTextarea';

export const AdminFormDateInput: FunctionComponent<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
> = ({ className = '', disabled, readOnly, ...props }) => (
  <div className={adminFormDateWrapClass}>
    <Calendar
      className="admin-form-date__icon pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-brand)]"
      strokeWidth={1.75}
      aria-hidden
    />
    <input
      type="date"
      {...props}
      disabled={disabled}
      readOnly={readOnly}
      className={`${adminFormDateInputClass} pe-10 ${disabled ? 'admin-form-input--disabled' : ''} ${readOnly ? 'admin-form-input--readonly' : ''} ${className}`.trim()}
    />
  </div>
);

export const AdminFormFileInput: FunctionComponent<
  InputHTMLAttributes<HTMLInputElement>
> = ({ className = '', ...props }) => (
  <div className="admin-form-file-wrap">
    <Upload className="admin-form-file-wrap__icon" strokeWidth={1.75} aria-hidden />
    <input type="file" {...props} className={`${adminFormFileClass} ${className}`.trim()} />
  </div>
);
