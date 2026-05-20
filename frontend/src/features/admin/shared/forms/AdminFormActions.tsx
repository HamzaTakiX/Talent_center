import { FunctionComponent, ReactNode } from 'react';
import { adminFormActionsFooterClass } from './adminFormClasses';

interface AdminFormActionsProps {
  children: ReactNode;
  /** Pied fixe en bas du viewport (formulaires longs). */
  sticky?: boolean;
  className?: string;
}

const AdminFormActions: FunctionComponent<AdminFormActionsProps> = ({
  children,
  sticky = true,
  className = '',
}) => (
  <div
    className={`${adminFormActionsFooterClass} ${sticky ? 'admin-form-actions--sticky' : ''} ${className}`.trim()}
  >
    {children}
  </div>
);

export default AdminFormActions;
