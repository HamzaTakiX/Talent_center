import { FunctionComponent, ReactNode } from 'react';

interface AdminTableProps {
  children: ReactNode;
  minWidth?: string;
  className?: string;
}

/** Conteneur table responsive avec styles admin unifiés. */
export const AdminTableScroll: FunctionComponent<AdminTableProps> = ({
  children,
  minWidth = '640px',
  className = '',
}) => (
  <div className={`admin-table-scroll ${className}`}>
    <table className="admin-table" style={{ minWidth }}>
      {children}
    </table>
  </div>
);

interface AdminTableSectionProps {
  children: ReactNode;
  className?: string;
}

export const AdminTableSection: FunctionComponent<AdminTableSectionProps> = ({
  children,
  className = '',
}) => <div className={`admin-module-panel-body ${className}`}>{children}</div>;

export default AdminTableScroll;
