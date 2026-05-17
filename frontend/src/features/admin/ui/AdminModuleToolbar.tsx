import { FunctionComponent, ReactNode } from 'react';

export interface AdminModuleToolbarProps {
  search: ReactNode;
  filter1?: ReactNode;
  filter2?: ReactNode;
  action?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

/**
 * Controls row: explicit CSS grid with one control per cell (no nested flex groups).
 * Prevents overlap — each column owns its width.
 */
const AdminModuleToolbar: FunctionComponent<AdminModuleToolbarProps> = ({
  search,
  filter1,
  filter2,
  action,
  className = '',
  'aria-label': ariaLabel = 'Module filters',
}) => {
  const hasFilter1 = filter1 != null;
  const hasFilter2 = filter2 != null;
  const hasAction = action != null;

  return (
    <div
      className={[
        'admin-module-toolbar',
        hasFilter1 && 'admin-module-toolbar--has-filter-1',
        hasFilter2 && 'admin-module-toolbar--has-filter-2',
        hasAction && 'admin-module-toolbar--has-action',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="toolbar"
      aria-label={ariaLabel}
    >
      <div className="admin-module-toolbar__cell admin-module-toolbar__cell--search">{search}</div>
      {hasFilter1 && (
        <div className="admin-module-toolbar__cell admin-module-toolbar__cell--filter-1">{filter1}</div>
      )}
      {hasFilter2 && (
        <div className="admin-module-toolbar__cell admin-module-toolbar__cell--filter-2">{filter2}</div>
      )}
      {hasAction && (
        <div className="admin-module-toolbar__cell admin-module-toolbar__cell--action">{action}</div>
      )}
    </div>
  );
};

export default AdminModuleToolbar;
