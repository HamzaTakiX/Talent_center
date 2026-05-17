import { FunctionComponent } from 'react';
import AdminCustomSelect, { type AdminSelectOption } from './AdminCustomSelect';

export type { AdminSelectOption };

interface AdminSelectFieldProps {
  value: string;
  options: readonly AdminSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  wrapperClassName?: string;
  id?: string;
  'aria-label'?: string;
}

/** Compact custom dropdown for toolbars and filter rows (portal menu, no native select). */
const AdminSelectField: FunctionComponent<AdminSelectFieldProps> = ({
  wrapperClassName = '',
  className = '',
  ...props
}) => (
  <div className={`admin-select-wrap ${wrapperClassName}`.trim()}>
    <AdminCustomSelect variant="compact" className={className} {...props} />
  </div>
);

export default AdminSelectField;
