import { FunctionComponent } from 'react';
import '../styles/auth-form.css';

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

export const ReadOnlyField: FunctionComponent<ReadOnlyFieldProps> = ({ label, value }) => (
  <div className="w-full flex flex-col gap-1.5">
    <div className="auth-form-field__label text-[13px] font-medium leading-none">{label}</div>
    <div className="auth-readonly-box w-full h-[44px] rounded-xl box-border overflow-hidden flex items-center py-1 px-3.5">
      <div className="auth-form-input text-[14px] truncate w-full">{value}</div>
    </div>
  </div>
);
