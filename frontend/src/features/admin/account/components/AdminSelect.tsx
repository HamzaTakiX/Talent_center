import { FunctionComponent } from 'react';
import { adminFormRequiredClass } from '../../shared/forms/adminFormClasses';
import AdminCustomSelect, { type AdminSelectOption } from '../../ui/AdminCustomSelect';

export type { AdminSelectOption };

interface AdminSelectProps {
  id: string;
  label: string;
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  description?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const AdminSelect: FunctionComponent<AdminSelectProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  description,
  searchable = false,
  disabled = false,
  required = false,
  error,
}) => (
  <div
    className={[
      'admin-form-field flex flex-col gap-1.5',
      error ? 'admin-form-field--error' : '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <label htmlFor={id} className="admin-form-label text-sm font-semibold text-[var(--admin-text)]">
      <span>{label}</span>
      {required ? (
        <span className={adminFormRequiredClass} aria-hidden>
          {' '}*
        </span>
      ) : null}
    </label>
    {description != null && description !== '' && !error && (
      <p className="-mt-1 text-xs text-[var(--admin-text-secondary)]">{description}</p>
    )}
    <AdminCustomSelect
      id={id}
      variant="default"
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      searchable={searchable || options.length > 8}
      aria-label={label}
      wrapperClassName={error ? 'admin-custom-select--error' : ''}
      aria-invalid={error ? true : undefined}
    />
    {error ? <p className="admin-form-field-error">{error}</p> : null}
  </div>
);

export default AdminSelect;
