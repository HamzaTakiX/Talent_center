import { FunctionComponent } from 'react';
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
}) => (
  <div className="admin-form-field flex flex-col gap-1.5">
    <label htmlFor={id} className="admin-form-label text-sm font-semibold text-[var(--admin-text)]">
      {label}
    </label>
    {description != null && description !== '' && (
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
    />
  </div>
);

export default AdminSelect;
