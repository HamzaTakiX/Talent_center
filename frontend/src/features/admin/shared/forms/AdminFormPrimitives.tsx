import { FunctionComponent, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';
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

export const AdminFormField: FunctionComponent<{
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}> = ({ label, htmlFor, required, hint, className = '', children }) => (
  <div className={`${adminFormFieldClass} ${className}`.trim()}>
    <label htmlFor={htmlFor} className={adminFormLabelClass}>
      {label}
      {required ? (
        <>
          {' '}
          <span className={adminFormRequiredClass} aria-hidden>
            *
          </span>
        </>
      ) : null}
    </label>
    {children}
    {hint ? <p className={adminFormHintClass}>{hint}</p> : null}
  </div>
);

export const AdminFormInput: FunctionComponent<InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...props
}) => <input {...props} className={`${adminFormInputClass} ${className}`.trim()} />;

export const AdminFormTextarea: FunctionComponent<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  ...props
}) => <textarea {...props} className={`${adminFormTextareaClass} ${className}`.trim()} />;

export const AdminFormDateInput: FunctionComponent<
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>
> = ({ className = '', ...props }) => (
  <div className={adminFormDateWrapClass}>
    <Calendar
      className="admin-form-date__icon pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-secondary)]"
      strokeWidth={1.75}
      aria-hidden
    />
    <input type="date" {...props} className={`${adminFormDateInputClass} pe-10 ${className}`.trim()} />
  </div>
);

export const AdminFormFileInput: FunctionComponent<InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...props
}) => <input type="file" {...props} className={`${adminFormFileClass} ${className}`.trim()} />;
