import { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface AcademicStructureFormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

const AcademicStructureFormSection: FunctionComponent<AcademicStructureFormSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}) => (
  <section className={`academic-form-section ${className}`.trim()}>
    <header className="academic-form-section__header">
      {Icon ? (
        <span className="academic-form-section__icon" aria-hidden>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      ) : null}
      <div className="min-w-0">
        <h4 className="academic-form-section__title">{title}</h4>
        {description ? <p className="academic-form-section__desc">{description}</p> : null}
      </div>
    </header>
    <div className="academic-form-section__body">{children}</div>
  </section>
);

export default AcademicStructureFormSection;
