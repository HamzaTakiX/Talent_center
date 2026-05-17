import { FunctionComponent, ReactNode } from 'react';
import DashboardPanel from '../../dashboard/ui/DashboardPanel';
import { staggerItem } from '../../dashboard/ui/animations';

interface AccountSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  sectionId?: string;
}

const AccountSection: FunctionComponent<AccountSectionProps> = ({
  title,
  description,
  children,
  className = '',
  sectionId,
}) => (
  <DashboardPanel
    variants={staggerItem}
    className={className}
    id={sectionId}
    data-admin-search-id={sectionId}
  >
    <div className="border-b border-[var(--admin-border)] px-5 py-4 sm:px-6">
      <h2 className="text-base font-semibold tracking-tight text-[var(--admin-text)]">{title}</h2>
      {description != null && description !== '' && (
        <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{description}</p>
      )}
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </DashboardPanel>
);

export default AccountSection;
