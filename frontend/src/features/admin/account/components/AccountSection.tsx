import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import DashboardPanel from '../../dashboard/ui/DashboardPanel';
import { staggerItem } from '../../dashboard/ui/animations';
import {
  ADMIN_FORM_SECTION_ICONS,
  type AdminFormSectionKey,
} from '../../shared/forms/adminFormIcons';

interface AccountSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  sectionId?: string;
  sectionKey?: AdminFormSectionKey;
  icon?: LucideIcon;
}

const AccountSection: FunctionComponent<AccountSectionProps> = ({
  title,
  description,
  children,
  className = '',
  sectionId,
  sectionKey,
  icon,
}) => {
  const SectionIcon = icon ?? (sectionKey ? ADMIN_FORM_SECTION_ICONS[sectionKey] : undefined);

  return (
    <DashboardPanel
      variants={staggerItem}
      className={`admin-form-section overflow-hidden ${className}`.trim()}
      id={sectionId}
      data-admin-search-id={sectionId}
    >
      <div className="admin-form-section__header">
        {SectionIcon ? (
          <span className="admin-form-section__icon-wrap" aria-hidden>
            <SectionIcon className="admin-form-section__icon" strokeWidth={1.75} />
          </span>
        ) : null}
        <div className="admin-form-section__titles min-w-0">
          <h2 className="admin-module-title text-base sm:text-lg">{title}</h2>
          {description != null && description !== '' && (
            <p className="admin-module-subtitle mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="admin-form-section__body p-5 sm:p-6">{children}</div>
    </DashboardPanel>
  );
};

export default AccountSection;
