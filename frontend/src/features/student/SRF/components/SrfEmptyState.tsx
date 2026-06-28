import { FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { STUDENT_ICON_CHIP_INFO } from '../../design-system/studentSemanticStyles';

interface SrfEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

const SrfEmptyState: FunctionComponent<SrfEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 px-6 py-10 text-center ${className}`.trim()}
  >
    <span className={`inline-flex h-12 w-12 shrink-0 rounded-[14px] ${STUDENT_ICON_CHIP_INFO}`}>
      <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)]">{title}</p>
      {description ? (
        <p className="m-0 mt-1 text-[13px] leading-5 text-[var(--admin-text-muted)]">{description}</p>
      ) : null}
    </div>
  </div>
);

export default SrfEmptyState;
