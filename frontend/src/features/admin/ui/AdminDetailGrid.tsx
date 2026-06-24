import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ADMIN_DETAIL_FIELD_ICONS,
  ADMIN_DETAIL_SECTION_ICONS,
  type AdminDetailFieldKey,
  type AdminDetailSectionKey,
} from '../shared/forms/adminFormIcons';

export interface AdminDetailField {
  label: string;
  value: ReactNode;
  fieldKey?: AdminDetailFieldKey;
  icon?: LucideIcon;
}

export interface AdminDetailSection {
  title: string;
  fields: AdminDetailField[];
  sectionKey?: AdminDetailSectionKey;
  icon?: LucideIcon;
}

interface AdminDetailGridProps {
  sections: AdminDetailSection[];
  className?: string;
}

const AdminDetailGrid: FunctionComponent<AdminDetailGridProps> = ({
  sections,
  className = '',
}) => (
  <div className={`admin-detail-grid${className ? ` ${className}` : ''}`.trim()}>
    {sections.map((section) => {
      const SectionIcon =
        section.icon ??
        (section.sectionKey ? ADMIN_DETAIL_SECTION_ICONS[section.sectionKey] : undefined);

      return (
        <section key={section.title} className="admin-detail-grid__section">
          <div className="admin-detail-grid__section-head">
            {SectionIcon ? (
              <span className="admin-detail-grid__section-icon-wrap" aria-hidden>
                <SectionIcon className="admin-detail-grid__section-icon" strokeWidth={1.75} />
              </span>
            ) : null}
            <h4 className="admin-detail-grid__section-title">{section.title}</h4>
          </div>
          <dl className="admin-detail-grid__fields">
            {section.fields.map((field) => {
              const FieldIcon =
                field.icon ??
                (field.fieldKey ? ADMIN_DETAIL_FIELD_ICONS[field.fieldKey] : undefined);

              return (
                <div key={field.label} className="admin-detail-grid__field">
                  <dt className="admin-detail-grid__label">
                    {FieldIcon ? (
                      <FieldIcon
                        className="admin-detail-grid__field-icon"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    ) : null}
                    <span>{field.label}</span>
                  </dt>
                  <dd className="admin-detail-grid__value">{field.value ?? '—'}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      );
    })}
  </div>
);

export default AdminDetailGrid;
