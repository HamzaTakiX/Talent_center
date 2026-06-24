import { FunctionComponent, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import AdminModuleToolbar from './AdminModuleToolbar';
import AdminSearchInput from './AdminSearchInput';
import AdminSelectField, { type AdminSelectOption } from './AdminSelectField';

export interface AdminListToolbarFilterConfig {
  value: string;
  onChange: (value: string) => void;
  options: readonly AdminSelectOption[];
  ariaLabel: string;
}

export type AdminListToolbarControlsLayout = 'grid' | 'grouped';

function selectFieldProps(filter: AdminListToolbarFilterConfig) {
  const { ariaLabel, ...rest } = filter;
  return { ...rest, 'aria-label': ariaLabel };
}

export interface AdminListToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  searchLoading?: boolean;
  filter1?: AdminListToolbarFilterConfig;
  filter2?: AdminListToolbarFilterConfig;
  createLabel?: string;
  onCreate?: () => void;
  toolbarAriaLabel?: string;
  actionExtra?: ReactNode;
  beforeCreate?: ReactNode;
  controlsLayout?: AdminListToolbarControlsLayout;
}

const AdminListToolbar: FunctionComponent<AdminListToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchAriaLabel,
  searchLoading = false,
  filter1,
  filter2,
  createLabel,
  onCreate,
  toolbarAriaLabel = 'List filters',
  actionExtra,
  beforeCreate,
  controlsLayout = 'grid',
}) => {
  const hasCreate = Boolean(onCreate && createLabel);
  const hasAction = hasCreate || actionExtra || beforeCreate || controlsLayout === 'grouped';

  const searchInput = (
    <AdminSearchInput
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      onClear={() => onSearchChange('')}
      placeholder={searchPlaceholder}
      aria-label={searchAriaLabel ?? searchPlaceholder}
      loading={searchLoading}
    />
  );

  const actionContent = (
    <div className="admin-list-toolbar__actions">
      {controlsLayout === 'grouped' ? searchInput : null}
      {controlsLayout === 'grouped' && filter1 ? (
        <AdminSelectField {...selectFieldProps(filter1)} />
      ) : null}
      {controlsLayout === 'grouped' && filter2 ? (
        <AdminSelectField {...selectFieldProps(filter2)} />
      ) : null}
      {actionExtra}
      {beforeCreate}
      {hasCreate && (
        <button type="button" className="admin-module-toolbar__btn" onClick={onCreate}>
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          <span>{createLabel}</span>
        </button>
      )}
    </div>
  );

  if (controlsLayout === 'grouped') {
    return (
      <div
        className="admin-module-toolbar admin-module-toolbar--grouped"
        role="toolbar"
        aria-label={toolbarAriaLabel}
      >
        <div className="admin-module-toolbar__cell admin-module-toolbar__cell--action">{actionContent}</div>
      </div>
    );
  }

  return (
    <AdminModuleToolbar
      aria-label={toolbarAriaLabel}
      search={searchInput}
      filter1={filter1 ? <AdminSelectField {...selectFieldProps(filter1)} /> : undefined}
      filter2={filter2 ? <AdminSelectField {...selectFieldProps(filter2)} /> : undefined}
      action={hasAction ? actionContent : undefined}
    />
  );
};

export const AdminListToolbarSection: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
  <div className="admin-list-toolbar-section">{children}</div>
);

export default AdminListToolbar;
