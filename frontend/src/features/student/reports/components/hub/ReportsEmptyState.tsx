import { FunctionComponent } from 'react';
import { FilePlus, ScrollText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReportsEmptyStateProps {
  variant?: 'section' | 'hub';
}

const ReportsEmptyState: FunctionComponent<ReportsEmptyStateProps> = ({ variant = 'section' }) => {
  const { t } = useTranslation();
  const Icon = variant === 'hub' ? ScrollText : FilePlus;

  return (
    <div className="student-reports-empty">
      <Icon className="student-reports-empty__icon" strokeWidth={1.25} aria-hidden />
      <h3 className="m-0 mb-1 text-base font-semibold text-[var(--admin-text)]">
        {t(`student.reports.empty.${variant}.title`)}
      </h3>
      <p className="m-0 max-w-sm text-sm text-[var(--admin-text-muted)]">
        {t(`student.reports.empty.${variant}.subtitle`)}
      </p>
    </div>
  );
};

export default ReportsEmptyState;
