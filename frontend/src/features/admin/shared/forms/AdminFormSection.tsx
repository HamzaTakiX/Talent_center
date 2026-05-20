import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ADMIN_FORM_SECTION_ICONS,
  type AdminFormSectionKey,
} from './adminFormIcons';

interface AdminFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  sectionKey?: AdminFormSectionKey;
  icon?: LucideIcon;
}

/** Section formulaire — panneau glass premium aligné dashboard. */
const AdminFormSection: FunctionComponent<AdminFormSectionProps> = ({
  title,
  description,
  children,
  className = '',
  sectionKey,
  icon,
}) => {
  const SectionIcon = icon ?? (sectionKey ? ADMIN_FORM_SECTION_ICONS[sectionKey] : undefined);

  return (
    <section
      className={`admin-form-section admin-module-panel overflow-hidden ${className}`.trim()}
    >
      <div className="admin-form-section__header">
        {SectionIcon ? (
          <span className="admin-form-section__icon-wrap" aria-hidden>
            <SectionIcon className="admin-form-section__icon" strokeWidth={1.75} />
          </span>
        ) : null}
        <div className="admin-form-section__titles min-w-0">
          <h2 className="admin-module-title">{title}</h2>
          {description ? <p className="admin-module-subtitle mt-1">{description}</p> : null}
        </div>
      </div>
      <div className="admin-form-section__body p-5 sm:p-6">{children}</div>
    </section>
  );
};

export default AdminFormSection;
