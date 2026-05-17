import { FunctionComponent, ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import AdminSearchInput from './AdminSearchInput';
import AdminButton from './AdminButton';

interface AdminSearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filterLabel?: string;
  onFilterClick?: () => void;
  actions?: ReactNode;
}

const AdminSearchFilterBar: FunctionComponent<AdminSearchFilterBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  filterLabel = 'Filter',
  onFilterClick,
  actions,
}) => (
  <div className="admin-toolbar flex-col sm:flex-row">
    <AdminSearchInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClear={() => onChange('')}
      placeholder={placeholder}
      containerClassName="min-w-0 flex-1"
    />
    <AdminButton variant="secondary" size="md" onClick={onFilterClick} className="shrink-0">
      <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
      <span>{filterLabel}</span>
    </AdminButton>
    {actions}
  </div>
);

export default AdminSearchFilterBar;
